"""AUREL / Garden room. Original full-scale architectural world, in metres.

The caller supplies photographed PBR materials, HDRI, Cycles/CUDA settings and
output resolution. This module builds geometry and two eye-height compositions;
it neither clears the scene nor renders. Call build(materials, 'wide'|'detail').
"""

import math
import random

import bpy

from world_common import (
    baked_cloth, area, branch, camera, cube, cylinder, lathe_vessel, plant, poly_curve,
    rounded_box, sun, tree,
)


def _mesh(name, vertices, faces, mat, smooth=False, uv=None):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    mesh.materials.append(mat)
    if uv:
        layer = mesh.uv_layers.new(name='Surface in metres')
        for polygon in mesh.polygons:
            for loop_index in polygon.loop_indices:
                layer.data[loop_index].uv = uv[mesh.loops[loop_index].vertex_index]
    else:
        _physical_uv(obj)
    if smooth:
        for polygon in mesh.polygons:
            polygon.use_smooth = True
    return obj


def _physical_uv(obj):
    """Use actual metre dimensions for photographed materials on custom meshes."""
    mesh = obj.data
    layer = mesh.uv_layers.active or mesh.uv_layers.new(name='Surface in metres')
    for polygon in mesh.polygons:
        axis = max(range(3), key=lambda i: abs(polygon.normal[i]))
        for index in polygon.loop_indices:
            co = mesh.vertices[mesh.loops[index].vertex_index].co
            layer.data[index].uv = ((co.y, co.z) if axis == 0 else
                                    ((co.x, co.z) if axis == 1 else (co.x, co.y)))


def _tint(source, name, color):
    """Retain photographed weave/roughness/normal while tinting its colour."""
    mat = source.copy()
    mat.name = name
    if not mat.use_nodes:
        return mat
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    shader = next((n for n in nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if shader:
        base = shader.inputs['Base Color']
        tint = nodes.new('ShaderNodeMixRGB')
        tint.blend_type = 'MULTIPLY'
        tint.inputs[0].default_value = 1
        tint.inputs[2].default_value = (*color, 1)
        if base.is_linked:
            links.new(base.links[0].from_socket, tint.inputs[1])
        else:
            tint.inputs[1].default_value = base.default_value
        links.new(tint.outputs[0], base)
    return mat


def _cushion_geometry(size, seed, compress_seat=False):
    """Closed cushion with its sewn perimeter normal to the actual thin axis.

    Unique poles and wrapped ring indices share smooth normals at the former
    longitude split. Cyclic axis permutations keep every face outward-facing.
    Seat sampling/compression is unchanged where the baked throw contacts it.
    """
    rng = random.Random(seed)
    phase = rng.random() * math.tau
    rings, segments = 30, 80
    thin = min(range(3), key=lambda axis: size[axis])
    u, v, w = ((1, 2, 0), (2, 0, 1), (0, 1, 2))[thin]

    def signed(value, power):
        # sin(pi) rounding must not create distinct copies of a nominal pole.
        return 0.0 if abs(value) < 1e-12 else math.copysign(abs(value) ** power, value)

    def surface(latitude, angle):
        cl = abs(math.cos(latitude)) ** .35
        zz = signed(math.sin(latitude), .4)
        xx = cl * signed(math.cos(angle), .35)
        yy = cl * signed(math.sin(angle), .35)
        crease = .0035 * math.sin(angle * 15 + phase) * (1 - abs(zz)) ** 4
        point = [0.0, 0.0, 0.0]
        point[u] = xx * (size[u] / 2 + crease)
        point[v] = yy * (size[v] / 2 + crease)
        point[w] = zz * size[w] / 2
        if compress_seat:
            crown = max(0, zz) ** 4
            point[w] -= .014 * math.exp(-((xx + .08) ** 2 / .35 + (yy + .12) ** 2 / .48)) * crown
            point[w] -= .004 * math.exp(-((abs(xx) - .83) / .09) ** 2) * (1 - yy * yy) * crown
        return tuple(point)

    bottom = [0.0, 0.0, 0.0]
    bottom[w] = -size[w] / 2
    vertices = [tuple(bottom)]
    for j in range(1, rings):
        latitude = -math.pi / 2 + math.pi * j / rings
        for i in range(segments):
            vertices.append(surface(latitude, math.tau * i / segments))
    top = [0.0, 0.0, 0.0]
    top[w] = size[w] / 2
    if compress_seat:
        top[w] -= .014 * math.exp(-(.08 ** 2 / .35 + .12 ** 2 / .48))
    top_index = len(vertices)
    vertices.append(tuple(top))
    faces = [(0, 1 + (i + 1) % segments, 1 + i) for i in range(segments)]
    for j in range(rings - 2):
        row = 1 + j * segments
        for i in range(segments):
            next_i = (i + 1) % segments
            faces.append((row + i, row + next_i, row + segments + next_i, row + segments + i))
    last = 1 + (rings - 2) * segments
    faces.extend((last + i, last + (i + 1) % segments, top_index) for i in range(segments))

    # Use the mesh's equator itself, including its small crease deformations.
    # The 3.4mm cord is lightly embedded like sewn upholstery piping; it never
    # runs across a broad cushion face or floats off an unrelated ideal outline.
    start = 1 + (rings // 2 - 1) * segments
    perimeter = vertices[start:start + segments]
    seam_points = []
    for i, point in enumerate(perimeter):
        before, after = perimeter[(i - 1) % segments], perimeter[(i + 1) % segments]
        du, dv = after[u] - before[u], after[v] - before[v]
        length = math.hypot(du, dv)
        sewn = list(point)
        sewn[u] += .001 * dv / length
        sewn[v] -= .001 * du / length
        seam_points.append(tuple(sewn))
    return vertices, faces, seam_points, thin


def _soft_block(name, center, size, mat, rotation=(0, 0, 0), seed=1):
    vertices, faces, seam_points, thin = _cushion_geometry(
        size, seed, compress_seat='seat cushion' in name.lower())
    # Physical planar UV islands do not require split geometric vertices or a
    # pinched spherical UV pole in the middle of a back cushion's visible face.
    obj = _mesh(name, vertices, faces, mat, True)
    obj.location = center
    obj.rotation_euler = rotation
    seam = poly_curve(name + ' / sewn perimeter', seam_points, .0017, mat)
    seam.data.splines[0].use_cyclic_u = True
    seam.parent = obj
    obj['upholstery_seam_plane'] = ('YZ', 'XZ', 'XY')[thin]
    return obj


def _veneer_leaf_uv(obj, origin):
    """A cut veneer leaf, sampled once from the photographed grain atlas.

    The atlas is treated as a 6m-wide selection of leaves, 2.8m along the grain.
    Compensating the existing material Mapping node keeps these UVs in actual
    source-image coordinates. Separate crop positions avoid repeated ovals.
    """
    material = obj.data.materials[0]
    mapping = next(node for node in material.node_tree.nodes if node.type == 'MAPPING')
    sx, sy, _ = mapping.inputs['Scale'].default_value
    layer = obj.data.uv_layers.active
    for face in obj.data.polygons:
        if abs(face.normal.x) < .9:
            continue
        for index in face.loop_indices:
            co = obj.data.vertices[obj.data.loops[index].vertex_index].co
            layer.data[index].uv = ((origin[0] + co.y / 6.0) / sx,
                                    (origin[1] + co.z / 2.8) / sy)


def _fluted_door(name, y0, y1, m):
    """Solid walnut front with 28mm half-round reeds and real 4mm valleys."""
    cube(name + ' / substrate', (-4.115, (y0 + y1) / 2, .435),
         (.115, y1 - y0, .65), m['walnut'], .003)
    vertices, faces, uv = [], [], []
    pitch = .032
    count = int((y1 - y0 - .012) / pitch)
    for ridge in range(count):
        cy = y0 + .012 + pitch * (ridge + .5)
        start = len(vertices)
        for z in (.111, .759):
            for segment in range(17):
                a = -math.pi / 2 + math.pi * segment / 16
                vertices.append((-4.054 + .014 * math.cos(a),
                                 cy + .014 * math.sin(a), z))
                uv.append(((cy + .014 * math.sin(a)) * 2, z * 2))
        for segment in range(16):
            faces.append((start + segment, start + segment + 1,
                          start + 18 + segment, start + 17 + segment))
        faces.append(tuple(start + k for k in reversed(range(17))))
        faces.append(tuple(start + 17 + k for k in range(17)))
    _mesh(name + ' / carved walnut reeds', vertices, faces, m['walnut'], True, uv)
    # Dark finger pocket below the continuous top; no oversized applied hardware.
    cube(name + ' / finger recess', (-4.07, (y0 + y1) / 2, .782),
         (.065, y1 - y0 - .012, .032), m['ink'], .002)
    cube(name + ' / bronze pull edge', (-4.014, (y0 + y1) / 2, .797),
         (.012, y1 - y0 - .022, .009), m['brass'], .0015)


def _book(name, center, width, depth, height, cover, pages, angle=0):
    # Separate page block, cloth boards and the slightly proud spine.
    group = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(group)
    group.location = center
    group.rotation_euler.z = angle
    pieces = [
        cube(name + ' / pages', (0, 0, 0), (width - .008, depth - .012, height - .007), pages, .001),
        cube(name + ' / front cloth', (0, 0, height / 2), (width, depth, .003), cover, .001),
        cube(name + ' / back cloth', (0, 0, -height / 2), (width, depth, .003), cover, .001),
        cube(name + ' / spine', (-width / 2, 0, 0), (.005, depth, height), cover, .002),
    ]
    for obj in pieces:
        obj.parent = group
    for i in range(5):
        line = cube(name + f' / page edge {i}', (width / 2 - .006, 0, -height * .33 + i * height * .16),
                    (.0008, depth - .022, .0005), cover, 0)
        line.parent = group
    return group


def _cup(name, position, ceramic):
    # Lathed section includes interior, rounded rim and a closed base.
    profile = [(.001, 0), (.025, 0), (.029, .005), (.035, .015),
               (.038, .06), (.037, .075), (.034, .077), (.0315, .074),
               (.032, .018), (.026, .009), (.001, .009)]
    vertices = [(position[0] + r * math.cos(i / 64 * math.tau),
                 position[1] + r * math.sin(i / 64 * math.tau), position[2] + z)
                for r, z in profile for i in range(64)]
    faces = [(j * 64 + i, j * 64 + (i + 1) % 64,
              (j + 1) * 64 + (i + 1) % 64, (j + 1) * 64 + i)
             for j in range(len(profile) - 1) for i in range(64)]
    _mesh(name, vertices, faces, ceramic, True)
    points = [(position[0] + .034 + .022 * math.sin(a), position[1],
               position[2] + .044 + .022 * math.cos(a))
              for a in [i * math.pi / 30 for i in range(31)]]
    poly_curve(name + ' / handle', points, .004, ceramic)


def _throw(m):
    return baked_cloth('aurel',m,'A casually thrown wool-linen blanket / simulated gravity folds')


def _architecture(m):
    # An enclosed room, not a set standing on an infinite plane.
    cube('Structural floor below stone finish', (0, -.7, -.15), (10, 10.2, .24), m['concrete'], .005)
    for ix in range(8):
        for iy in range(8):
            cube(f'Interior limestone slab {ix:02}-{iy:02}',
                 (-4.375 + ix * 1.25, -4.8875 + iy * 1.175, -.022),
                 (1.247, 1.172, .045), m['floor'], .002)
    cube('West wall / thick lime-plastered enclosure', (-4.95, -.5, 1.64), (.3, 10, 3.28), m['plaster'], .015)
    cube('South wall behind the camera', (0, -5.47, 1.64), (10.2, .24, 3.28), m['plaster'], .015)
    cube('East return behind camera', (4.94, -3.75, 1.64), (.26, 3.45, 3.28), m['plaster'], .012)
    cube('Continuous ceiling / fine shadow reveal', (0, -.7, 3.3), (10.2, 10.2, .18), m['plaster'], .009)
    cube('West perimeter ceiling shadow joint', (-4.79, -.5, 3.205), (.021, 9.7, .018), m['ink'], .001)
    cube('Garden lintel / plaster soffit', (1, 3.96, 3.22), (8, .34, .22), m['plaster'], .005)
    # Glazing can transmit light and physically reflects the inhabitable room.
    for x0, x1 in [(-2.9, -.99), (-.96, .95), (.98, 2.89), (2.92, 4.78)]:
        center = (x0 + x1) / 2
        cube(f'North glazing / {x0:.2f}', (center, 3.91, 1.59),
             (x1 - x0, .012, 3.105), m['glass'], .001)
        for x in (x0, x1):
            cube(f'Slim bronze window jamb {x:.2f}', (x, 3.91, 1.59),
                 (.028, .074, 3.16), m['brass'], .002)
    for z in (.025, 3.16):
        cube('North bronze glazing rail', (.94, 3.91, z), (7.83, .09, .03), m['brass'], .002)
    for y0, y1 in [(-2.05, -.13), (-.10, 1.86), (1.89, 3.91)]:
        cube(f'East return glazing {y0:.2f}', (4.8, (y0 + y1) / 2, 1.59),
             (.012, y1 - y0, 3.10), m['glass'], .001)
        cube(f'East bronze jamb {y0:.2f}', (4.8, y0, 1.59), (.074, .027, 3.16), m['brass'], .002)
    for z in (.025, 3.16):
        cube('East bronze glazing rail', (4.8, .93, z), (.074, 6, .03), m['brass'], .002)
    cube('Sliding door recessed handle', (2.88, 3.859, 1.12), (.018, .022, .24), m['brass'], .004)
    for y in (3.82, 3.855, 3.89):
        cube('Flush bronze threshold track', (.9, y, .008), (7.8, .006, .007), m['brass'], .001)
    # A visible structure continues outside the envelope.
    cube('Garden canopy / concrete roof', (1, 5.03, 3.31), (9, 2.32, .19), m['concrete'], .012)
    for x in (-3.36, 5.35):
        cube('Garden canopy bronze column', (x, 5.95, 1.6), (.075, .075, 3.2), m['brass'], .004)
    for x in (-2.8, -1.8, -.8, .2, 1.2, 2.2, 3.2, 4.2):
        cube('Canopy walnut soffit panel', (x, 5.02, 3.197), (.994, 2.25, .025), m['walnut'], .002)


def _joinery(m):
    # Full west wall: individual veneers, shadow joints, 12 low cabinet doors.
    cube('Joinery carcass / deep continuous walnut', (-4.47, .0, 1.58), (.55, 7.55, 3.1), m['walnut'], .003)
    for y in [-3.37, 3.28]:
        cube('Tall veneer door', (-4.164, y, 1.595), (.047, .86, 3.145), m['walnut'], .003)
        cube('Tall door vertical pull', (-4.131, y + .32, 1.23), (.012, .017, .49), m['brass'], .002)
    # Recessed opening is built from separate planes, no faux painted niche.
    cube('Niche / travertine back', (-4.188, -.045, 1.775), (.026, 5.56, 1.68), m['stone'], .004)
    # Narrow, separately cut veneer leaves follow the original header envelope.
    # The shared rosewood photograph already contains large bookmatched ovals;
    # repeating it every 1.8m turned this quiet joinery into a stamped pattern.
    # These lower-grain crops stay within one atlas rather than tiling it.
    for i in range(9):
        width = 5.56 / 9
        header = cube(f'Niche / walnut header veneer leaf {i + 1:02}',
                      (-4.095, -2.825 + width * (i + .5), 2.91),
                      (.205, width - .002, .58), m['walnut'], .001)
        _veneer_leaf_uv(header, (.07 + i * .106, .22 + (.0, .045, -.025)[i % 3]))
    cube('Niche / top stone lining', (-4.006, -.045, 2.59), (.37, 5.54, .045), m['stone'], .004)
    for y in (-2.825, 2.735):
        cube('Niche / stone cheek', (-3.999, y, 1.73), (.39, .05, 1.755), m['stone'], .004)
    cube('Cabinet recessed toe kick', (-4.24, 0, .063), (.44, 7.48, .085), m['ink'], .003)
    for i in range(12):
        y0 = -3.74 + i * .624
        _fluted_door(f'Walnut cabinet door {i + 1:02}', y0, y0 + .62, m)
    cube('Travertine counter / eased 46mm edge', (-4.16, -.01, .839),
         (.66, 7.56, .046), m['stone'], .004)
    cube('Brass shadow joint under the stone', (-4.164, -.01, .809),
         (.652, 7.56, .006), m['brass'], .001)
    # Functional object groupings: a listening shelf, books and a single branch.
    for i, spec in enumerate([(.24, .34, .025, -.08), (.22, .32, .036, .02), (.25, .31, .018, -.025)]):
        width, depth, height, angle = spec
        _book(f'Architecture folio {i}', (-4.00, -1.85, .88 + i * .03),
              width, depth, height, m['ink'] if i == 1 else m['linen'], m['plaster'], angle)
    vessel = lathe_vessel('Hand-thrown stoneware on the counter', (-4.00, 1.72, .864), m['clay'])
    vessel.scale = (.66, .66, .76)
    _physical_uv(vessel)
    for i, end in enumerate([(-3.93, 1.64, 1.84), (-3.86, 1.88, 1.67), (-4.10, 1.49, 1.72)]):
        branch(f'Single dried botanical stem {i}', (-4.00, 1.72, 1.15), end, .0038, m['walnut'])
    # Compact stone tray, espresso objects and a shallow catch-all read at human scale.
    rounded_box('Small valet tray', (-4.00, -.36, .875), (.285, .36, .025), m['stone'], bevel=.016)
    _cup('Ceramic cup on the joinery', (-3.99, -.4, .899), m['plaster'])
    cylinder('Cup saucer', (-3.99, -.4, .892), .057, .007, m['plaster'], 96, .003)
    area('Warm concealed joinery wash', (-3.98, -.1, 2.575), (-4.16, -.1, 1.42),
         48, (1, .77, .52), 4.7, .045)


def _living(m):
    olive = _tint(m['linen'], 'Muted olive wool / photograph retained', (.38, .43, .29))
    taupe = _tint(m['linen'], 'Warm mushroom upholstery / photograph retained', (.72, .64, .53))
    pages = m['plaster']
    # A restrained handwoven rug establishes a domestic ground plane.
    rounded_box('Large handwoven wool rug', (.05, -.80, .012), (4.8, 4.8, .018), taupe, bevel=.025)
    for side in (-1, 1):
        for i in range(112):
            x = -2.32 + i * .042
            y = -.8 + side * 2.405
            poly_curve(f'Rug bound fringe {side} {i}', [(x, y, .023), (x + .004, y + side * .035, .017),
                                                      (x + .009, y + side * .063, .016)], .0012, taupe)
    # Sofa sits on a slender walnut plinth; cushions are separate sewn forms.
    rounded_box('Sofa floating walnut platform', (.5, .18, .22), (3.23, 1.16, .10), m['walnut'], bevel=.02)
    for x in (-.85, 1.85):
        for y in (-.22, .57):
            cylinder('Sofa recessed bronze foot', (x, y, .105), .019, .21, m['brass'], 32, .003)
    rounded_box('Sofa upholstered foundation', (.5, .21, .35), (3.16, 1.12, .22), m['linen'], bevel=.09)
    for i, x in enumerate((-.48, .50, 1.48)):
        _soft_block(f'Sofa seat cushion {i + 1}', (x, .12, .535), (.967, .94, .20), m['linen'], seed=31 + i)
        _soft_block(f'Sofa back cushion {i + 1}', (x, .66, .815), (.99, .27, .70),
                    m['linen'], (math.radians(10), 0, 0), seed=50 + i)
    for x in (-1.08, 2.08):
        _soft_block('Soft sofa arm', (x, .17, .59), (.23, 1.06, .66), m['linen'], seed=int((x + 2) * 10))
    _soft_block('Loose olive lumbar cushion', (-.69, .42, .865), (.48, .23, .48), olive,
                (math.radians(18), math.radians(-8), math.radians(-12)), seed=64)
    _soft_block('Loose folded linen cushion', (1.46, .46, .90), (.51, .21, .49), taupe,
                (math.radians(13), math.radians(7), math.radians(9)), seed=80)
    _throw(olive)
    # Low stone table has a believable 32mm edge, recessed underframe and split legs.
    rounded_box('Travertine coffee table / thin top', (-.16, -1.45, .37), (1.56, .81, .044), m['stone'], bevel=.022)
    for x in (-.64, .32):
        cube('Travertine coffee table / blade leg', (x, -1.45, .176), (.13, .64, .31), m['stone'], .007)
    _book('Open-ended reading book', (-.40, -1.43, .414), .285, .34, .035,
          olive, pages, math.radians(-9))
    cylinder('Small brass tea tray', (.28, -1.42, .399), .14, .012, m['brass'], 96, .003)
    _cup('Tea cup after a quiet morning', (.27, -1.43, .405), m['plaster'])
    # Chair is asymmetrically placed in the foreground, with an exposed timber frame.
    chair = bpy.data.objects.new('Reading chair / slight turn towards garden', None)
    bpy.context.collection.objects.link(chair)
    # Keep the reading chair as a foreground edge, leaving the sofa and textile
    # layering legible. The former camera-adjacent placement masked a third of it.
    chair.location = (3.20, -1.94, 0)
    chair.rotation_euler.z = math.radians(-20)
    pieces = []
    for x in (-.38, .38):
        for y in (-.37, .36):
            leg = cube('Chair tapered oak support', (x, y, .25), (.045, .052, .5), m['oak'], .009)
            leg.rotation_euler.y = math.radians(-6 if x < 0 else 6)
            pieces.append(leg)
        pieces.append(cube('Chair walnut arm', (x, -.02, .69), (.064, .88, .045), m['walnut'], .012))
        pieces.append(cube('Chair oak back stile', (x, .36, .64), (.046, .052, .8), m['oak'], .008))
    pieces.append(_soft_block('Reading chair seat', (0, -.04, .455), (.76, .73, .15), taupe, seed=32))
    pieces.append(_soft_block('Reading chair back', (0, .32, .79), (.75, .16, .56), taupe,
                              (math.radians(12), 0, 0), seed=33))
    for obj in pieces:
        obj.parent = chair
    cylinder('Small side table base', (-1.74, .59, .032), .23, .055, m['ink'], 96, .008)
    cylinder('Side table slender bronze stem', (-1.74, .59, .263), .022, .46, m['brass'], 48, .003)
    cylinder('Side table stone top', (-1.74, .59, .505), .29, .029, m['stone'], 128, .007)
    _book('Book left by the sofa', (-1.75, .60, .535), .18, .23, .025, m['ink'], pages, .21)
    # A small shaded lamp contributes an honest local light, not a studio fill.
    cylinder('Bronze reading lamp foot', (-2.27, 1.27, .025), .17, .045, m['brass'], 96, .005)
    cylinder('Bronze reading lamp stem', (-2.27, 1.27, .655), .011, 1.27, m['brass'], 48, .002)
    vertices, faces = [], []
    for z, radius in [(1.22, .235), (1.55, .14)]:
        for i in range(96):
            a = i / 96 * math.tau
            vertices.append((-2.27 + radius * math.cos(a), 1.27 + radius * math.sin(a), z))
    for i in range(96):
        faces.append((i, (i + 1) % 96, (i + 1) % 96 + 96, i + 96))
    shade = _mesh('Fine linen conical reading shade', vertices, faces, m['linen'], True)
    modifier = shade.modifiers.new('Shade fabric thickness', 'SOLIDIFY')
    modifier.thickness = .0008
    area('Reading lamp / warm downward pool', (-2.27, 1.27, 1.27), (-2.27, 1.27, 0),
         12, (1, .73, .47), .13)


def _garden(m):
    # Full environment out to 25m; each layer has a different scale and silhouette.
    cube('Garden earth / full site', (0, 12, -.3), (38, 32, .5), m['soil'], .01)
    for ix in range(9):
        for iy in range(3):
            cube(f'Exterior terrace stone {ix}-{iy}', (-3.85 + ix * 1.08, 4.44 + iy * .82, -.006),
                 (1.075, .815, .046), m['floor'], .003)
    # The water basin is beyond the terrace, not an arbitrary object in the room.
    cube('Shallow reflecting rill / stone bed', (1.42, 7.15, -.12), (6.5, 1.2, .23), m['ink'], .01)
    cube('Still water surface', (1.42, 7.15, .009), (6.38, 1.08, .012), m['water'], .002)
    for y in (6.55, 7.75):
        cube('Honed stone water coping', (1.42, y, .027), (6.6, .105, .09), m['stone'], .005)
    for x in (-1.87, 4.71):
        cube('Honed stone rill end', (x, 7.15, .027), (.105, 1.2, .09), m['stone'], .005)
    for i in range(5):
        cube(f'Garden stepping slab {i}', (-2.75, 7.0 + i * 1.3, .04), (1.02, .84, .16), m['stone'], .012)
    # Actual garden perimeter and distant architecture prevent a horizon void.
    cube('Garden retaining wall', (-5.4, 12.4, .44), (.35, 17.5, 1), m['concrete'], .012)
    cube('Rear garden boundary / limewashed stone', (0, 19.7, 1.15), (28, .3, 2.5), m['plaster'], .015)
    cube('Far garden boundary / return', (12, 14.6, 1.15), (.3, 10.4, 2.5), m['plaster'], .015)
    cube('Distant garden pavilion / roof', (7.2, 16.1, 2.89), (5.3, 3.4, .2), m['concrete'], .008)
    cube('Distant garden pavilion / warm wall', (7.2, 17.5, 1.4), (5.3, .25, 2.8), m['walnut'], .004)
    for x in (4.7, 9.7):
        cube('Distant pavilion slender column', (x, 14.6, 1.4), (.07, .07, 2.8), m['brass'], .003)
    for name, position, height, seed in [
        ('Near garden olive', (-.85, 9.1, .0), 4.2, 31),
        ('East terrace canopy', (6.2, 7.8, .0), 5.0, 18),
        ('West garden canopy', (-4.8, 9.8, .0), 4.8, 7),
        ('Middle garden olive', (2.8, 13.9, .0), 5.4, 47),
        ('Distant trees west', (-6.2, 17.1, .0), 6.3, 26),
        ('Distant trees centre', (.7, 20.3, .0), 6.5, 64),
        ('Distant trees east', (8.8, 20.5, .0), 6.8, 80),
    ]:
        tree(name, position, height=height, seed=seed)
    rng = random.Random(23)
    for i in range(35):
        if i < 15:
            x, y = -4.55 + rng.random() * 2.4, 7.1 + rng.random() * 8
        else:
            x, y = -.5 + rng.random() * 10, 8.15 + rng.random() * 8.6
        plant(f'Layered garden grasses {i:02}', (x, y, .035), size=.48 + rng.random() * .48, seed=120 + i)
    # Close planting on the east return is visible as a foreground garden layer.
    for i in range(9):
        plant(f'Terrace edge planting {i:02}', (5.55 + .19 * (i % 3), -.3 + i * .63, .03),
              size=.52 + .06 * (i % 4), seed=170 + i)


def build(m, view='wide'):
    """Build the same inhabited architectural world for wide and material views."""
    if view not in ('wide', 'detail', 'close'):
        raise ValueError("AUREL view must be 'wide' or 'detail'")
    _architecture(m)
    _joinery(m)
    _living(m)
    _garden(m)
    # Low east light enters through the return glazing in front of the sofa.
    # Its old north direction mostly lit the back of the cushions, leaving the
    # camera-facing upholstery muddy. This direction also lets the jambs and
    # terrace planting cast actual narrow shadows across the seating and rug.
    # HDRI/exposure stay with the caller; all bounce emitters remain at windows.
    sun((11, -3, 6), (-3, 1, .3), energy=2.3, color=(1, .92, .81), angle=.032)
    area('Garden sky at the open facade', (.6, 5.0, 2.6), (-.6, -1.1, 1.15),
         220, (.88, .94, 1), 6.0, 1.7)
    area('East garden reflected daylight', (5.10, -.92, 2.35), (.35, -.5, .75),
         110, (1, .96, .87), 2.6, 2.15)
    if view == 'wide':
        cam = camera((3.55, -4.82, 1.5), (-.55, 1.72, 1.50), lens=30, focus=(-.2, .3, .72), fstop=9)
        cam.data.shift_y = -.025
        cam.name = 'AUREL / seated room and layered garden / 1.5m eye height'
    else:
        cam = camera((-2.30, -2.72, 1.5), (-4.00, .53, 1.08), lens=52, focus=(-4.01, .05, .92), fstop=7.1)
        cam.name = 'AUREL / walnut reeds, stone and bronze / 1.5m eye height'
    cam.data.clip_start = .04
    cam.data.clip_end = 160
    # Metadata travels with a saved blend and makes composition intent inspectable.
    bpy.context.scene['aurel_world'] = 'Garden room: full-scale original architecture, inhabited interior, layered garden'
    bpy.context.scene['aurel_camera_view'] = view
    bpy.context.scene['aurel_units'] = 'metres; finished ceiling 3.2m; camera 1.5m'
    return cam

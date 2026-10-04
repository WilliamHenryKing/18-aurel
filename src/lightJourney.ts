/** Camera coordinates refer to the interactive section model, not the offline rendered residence. */
export const lightChapters = [
  {
    id: "threshold",
    label: "Threshold",
    title: "A room begins with a threshold.",
    copy: "The low roof holds the room. An open edge draws you towards the light.",
    progress: 0,
  },
  {
    id: "timber",
    label: "Timber screen",
    title: "Light finds a rhythm.",
    copy: "Fine timber uprights filter the opening. Bronze and linen bring it back to human scale.",
    progress: 0.5,
  },
  {
    id: "water",
    label: "Water",
    title: "Leave room for stillness.",
    copy: "A narrow basin meets the stone. The surface holds a quieter reflection of the room.",
    progress: 1,
  },
] as const;

export type CameraPoint = [number, number, number];

// The path stays in front of the open section; it never travels through the roof or rear wall.
// A paired target curve makes this a dolly with a deliberate change of subject, not an orbit.
export const cameraPath: CameraPoint[] = [
  [9.3, 6.2, 16.1],
  [6.6, 3.8, 11.2],
  [4.3, 2.65, 7.7],
  [0.2, 2.7, 8.1],
  [-3.8, 2.9, 8.6],
];

export const cameraTargets: CameraPoint[] = [
  [0, 0.85, 0],
  [0.9, 1.1, -0.2],
  [1.45, 1.2, -0.6],
  [-0.5, 0.8, -0.35],
  [-2.4, 0.7, -0.25],
];

// Pull back along the same sightline on narrow canvases, retaining the approach and roof edge.
export const mobilePullback = [1.2, 1.2, 1.23, 1.2, 1.2];

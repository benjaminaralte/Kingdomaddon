
export const structures = [
  {
        name: "Dance Floor",
        id: "dance_floor",
        icon: "textures/ui/dance_floor",
        commands: {
          West: `/structure load dance_floor ~-14 ~-1 ~-6 270_degrees`,
          South: `/structure load dance_floor ~-6 ~-1 ~5 180_degrees`,
          East: `/structure load dance_floor ~5 ~-1 ~-4 90_degrees`,
          North: `/structure load dance_floor ~-4 ~-1 ~-14`,
        },
        offsets: {
          West: { dx: -14, dy: -1, dz: -6 },
          South: { dx: -6, dy: -1, dz: 5 },
          East: { dx: 5, dy: -1, dz: -4 },
          North: { dx: -4, dy: -1, dz: -14 },
        },
      },
      {
        name: "Lie Detector",
        id: "lie_detector",
        icon: "textures/ui/lie_detector",
        commands: {
          West: `/structure load lie_detector ~-15 ~-2 ~-4 270_degrees`,
          South: `/structure load lie_detector ~-4 ~-2 ~5 180_degrees`,
          East: `/structure load lie_detector ~5 ~-2 ~-4 90_degrees`,
          North: `/structure load lie_detector ~-4 ~-2 ~-15`,
        },
        offsets: {
          West: { dx: -15, dy: -2, dz: -4 },
          South: { dx: -4, dy: -2, dz: 5 },
          East: { dx: 5, dy: -2, dz: -4 },
          North: { dx: -4, dy: -2, dz: -15 },
        },
      },
      {
        name: "Rocket",
        id: "rocket",
        icon: "textures/ui/rocket",
        commands: {
          West: `/structure load rocket ~-17 ~0 ~-5 270_degrees`,
          South: `/structure load rocket ~-5 ~0 ~5 180_degrees`,
          East: `/structure load rocket ~5 ~0 ~-5 90_degrees`,
          North: `/structure load rocket ~-5 ~0 ~-17`,
        },
        offsets: {
          West: { dx: -17, dy: 0, dz: -5 },
          South: { dx: -5, dy: 0, dz: 5 },
          East: { dx: 5, dy: 0, dz: -5 },
          North: { dx: -5, dy: 0, dz: -17 },
        },
      },
      {
        name: "Spinning Lamp",
        id: "spinning_lamp",
        icon: "textures/ui/spining_lamp",
        commands: {
          West: `/structure load spinning_lamp ~-9 ~-1 ~-2 270_degrees`,
          South: `/structure load spinning_lamp ~-2 ~-1 ~5 180_degrees`,
          East: `/structure load spinning_lamp ~5 ~-1 ~-2 90_degrees`,
          North: `/structure load spinning_lamp ~-2 ~-1 ~-9`,
        },
        offsets: {
          West: { dx: -9, dy: -1, dz: -2 },
          South: { dx: -2, dy: -1, dz: 5 },
          East: { dx: 5, dy: -1, dz: -2 },
          North: { dx: -2, dy: -1, dz: -9 },
        },
      },
      {
        name: "Tank",
        id: "tank",
        icon: "textures/ui/tank",
        commands: {
          West: `/structure load tank ~-17 ~-1 ~-5 270_degrees`,
          South: `/structure load tank ~-5 ~-1 ~5 180_degrees`,
          East: `/structure load tank ~5 ~-1 ~-5 90_degrees`,
          North: `/structure load tank ~-5 ~-1 ~-17`,
        },
        offsets: {
          West: { dx: -17, dy: -1, dz: -5 },
          South: { dx: -5, dy: -1, dz: 5 },
          East: { dx: 5, dy: -1, dz: -5 },
          North: { dx: -5, dy: -1, dz: -17 },
        },
      },
];

export const structures = [
  {
        name: "Duo House 1",
        id: "duo_house1",
        icon: "textures/ui/duo_house1",
        commands: {
          West: `/structure load duo_house1 ~-25 ~-2 ~-10 270_degrees`,
          South: `/structure load duo_house1 ~-10 ~-2 ~5 180_degrees`,
          East: `/structure load duo_house1 ~5 ~-2 ~-10 90_degrees`,
          North: `/structure load duo_house1 ~-10 ~-2 ~-25`,
        },
        offsets: {
          West: { dx: -25, dy: -2, dz: -10 },
          South: { dx: -10, dy: -2, dz: 5 },
          East: { dx: 5, dy: -2, dz: -10 },
          North: { dx: -10, dy: -2, dz: -25 },
        },
      },
      {
        name: "Duo House 2",
        id: "duo_house2",
        icon: "textures/ui/duo_house2",
        commands: {
          West: `/structure load duo_house2 ~-18 ~-2 ~-12 270_degrees`,
          South: `/structure load duo_house2 ~-12 ~-2 ~4 180_degrees`,
          East: `/structure load duo_house2 ~4 ~-2 ~-12 90_degrees`,
          North: `/structure load duo_house2 ~-12 ~-2 ~-18`,
        },
        offsets: {
          West: { dx: -18, dy: -2, dz: -12 },
          South: { dx: -12, dy: -2, dz: 4 },
          East: { dx: 4, dy: -2, dz: -12 },
          North: { dx: -12, dy: -2, dz: -18 },
        },
      },
      {
        name: "Duo House 3",
        id: "duo_house3",
        icon: "textures/ui/duo_house3",
        commands: {
          West: `/structure load duo_house3 ~-18 ~-2 ~-12 270_degrees`,
          South: `/structure load duo_house3 ~-12 ~-2 ~4 180_degrees`,
          East: `/structure load duo_house3 ~4 ~-2 ~-12 90_degrees`,
          North: `/structure load duo_house3 ~-12 ~-2 ~-18`,
        },
        offsets: {
          West: { dx: -18, dy: -2, dz: -12 },
          South: { dx: -12, dy: -2, dz: 4 },
          East: { dx: 4, dy: -2, dz: -12 },
          North: { dx: -12, dy: -2, dz: -18 },
        },
      },
      {
        name: "Duo House 4",
        id: "duo_house4",
        icon: "textures/ui/duo_house4",
        commands: {
          West: `/structure load duo_house4 ~-19 ~-5 ~-11 270_degrees`,
          South: `/structure load duo_house4 ~-11 ~-5 ~5 180_degrees`,
          East: `/structure load duo_house4 ~5 ~-5 ~-12 90_degrees`,
          North: `/structure load duo_house4 ~-12 ~-5 ~-19`,
        },
        offsets: {
          West: { dx: -19, dy: -5, dz: -11 },
          South: { dx: -11, dy: -5, dz: 5 },
          East: { dx: 5, dy: -5, dz: -12 },
          North: { dx: -12, dy: -5, dz: -19 },
        },
      },
      {
        name: "Duo House 5",
        id: "duo_house5",
        icon: "textures/ui/duo_house5",
        commands: {
          West: `/structure load duo_house5 ~-21 ~-1 ~-10 180_degrees`,
          South: `/structure load duo_house5 ~-10 ~-1 ~5 90_degrees`,
          East: `/structure load duo_house5 ~5 ~-1 ~-9`,
          North: `/structure load duo_house5 ~-9 ~-1 ~-21 270_degrees`,
        },
        offsets: {
          West: { dx: -21, dy: -1, dz: -10 },
          South: { dx: -10, dy: -1, dz: 5 },
          East: { dx: 5, dy: -1, dz: -9 },
          North: { dx: -9, dy: -1, dz: -21 },
        },
      },
      {
        name: "Duo House 6",
        id: "duo_house6",
        icon: "textures/ui/duo_house6",
        commands: {
          West: `/structure load duo_house6 ~-23 ~-1 ~-11 180_degrees`,
          South: `/structure load duo_house6 ~-11 ~-1 ~5 90_degrees`,
          East: `/structure load duo_house6 ~5 ~-1 ~-11`,
          North: `/structure load duo_house6 ~-11 ~-1 ~-22 270_degrees`,
        },
        offsets: {
          West: { dx: -23, dy: -1, dz: -11 },
          South: { dx: -11, dy: -1, dz: 5 },
          East: { dx: 5, dy: -1, dz: -11 },
          North: { dx: -11, dy: -1, dz: -22 },
        },
      },
      {
        name: "Duo House 7",
        id: "duo_house7",
        icon: "textures/ui/duo_house7",
        commands: {
          West: [
                  `/structure load duo_house7_l0 ~-41 ~-1 ~-21`,
                  `/structure load duo_house7_l1 ~-41 ~7 ~-21`,
                ],
          South: [
                  `/structure load duo_house7_l0 ~-21 ~-1 ~5 270_degrees`,
                  `/structure load duo_house7_l1 ~-21 ~7 ~5 270_degrees`,
                ],
          East: [
                  `/structure load duo_house7_l0 ~5 ~-1 ~-21 180_degrees`,
                  `/structure load duo_house7_l1 ~5 ~7 ~-21 180_degrees`,
                ],
          North: [
                  `/structure load duo_house7_l0 ~-21 ~-1 ~-41 90_degrees`,
                  `/structure load duo_house7_l1 ~-21 ~7 ~-41 90_degrees`,
                ],
        },
        offsets: {
          West: { dx: -41, dy: -1, dz: -21 },
          South: { dx: -21, dy: -1, dz: 5 },
          East: { dx: 5, dy: -1, dz: -21 },
          North: { dx: -21, dy: -1, dz: -41 },
        },
      },
];
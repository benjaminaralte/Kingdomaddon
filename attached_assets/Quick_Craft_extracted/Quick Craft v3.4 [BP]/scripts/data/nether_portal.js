
export const structures = [
  {
        name: "Nether Portal 1",
        id: "nether_portal1",
        icon: "textures/ui/nether_portal1",
        commands: {
          West: `/structure load nether_portal1 ~-16 ~-1 ~-8 270_degrees`,
          South: `/structure load nether_portal1 ~-8 ~-1 ~5 180_degrees`,
          East: `/structure load nether_portal1 ~5 ~-1 ~-9 90_degrees`,
          North: `/structure load nether_portal1 ~-9 ~-1 ~-16`,
        },
        offsets: {
          West: { dx: -16, dy: -1, dz: -8 },
          South: { dx: -8, dy: -1, dz: 5 },
          East: { dx: 5, dy: -1, dz: -9 },
          North: { dx: -9, dy: -1, dz: -16 },
        },
      },
      {
        name: "Nether Portal 2",
        id: "nether_portal2",
        icon: "textures/ui/nether_portal2",
        commands: {
          West: `/structure load nether_portal2 ~-9 ~-1 ~-8 90_degrees`,
          South: `/structure load nether_portal2 ~-8 ~-1 ~4`,
          East: `/structure load nether_portal2 ~4 ~-1 ~-8 270_degrees`,
          North: `/structure load nether_portal2 ~-8 ~-1 ~-9 180_degrees`,
        },
        offsets: {
          West: { dx: -9, dy: -1, dz: -8 },
          South: { dx: -8, dy: -1, dz: 4 },
          East: { dx: 4, dy: -1, dz: -8 },
          North: { dx: -8, dy: -1, dz: -9 },
        },
      },
      {
        name: "Nether Portal 3",
        id: "nether_portal3",
        icon: "textures/ui/nether_portal3",
        commands: {
          West: `/structure load nether_portal3 ~-15 ~-1 ~-5 270_degrees`,
          South: `/structure load nether_portal3 ~-5 ~-1 ~5 180_degrees`,
          East: `/structure load nether_portal3 ~5 ~-1 ~-5 90_degrees`,
          North: `/structure load nether_portal3 ~-5 ~-1 ~-15`,
        },
        offsets: {
          West: { dx: -15, dy: -1, dz: -5 },
          South: { dx: -5, dy: -1, dz: 5 },
          East: { dx: 5, dy: -1, dz: -5 },
          North: { dx: -5, dy: -1, dz: -15 },
        },
      },
      {
        name: "Nether Portal 4",
        id: "nether_portal4",
        icon: "textures/ui/nether_portal4",
        commands: {
          West: `/structure load nether_portal4 ~-14 ~0 ~-5 90_degrees`,
          South: `/structure load nether_portal4 ~-5 ~0 ~4`,
          East: `/structure load nether_portal4 ~4 ~0 ~-5 270_degrees`,
          North: `/structure load nether_portal4 ~-5 ~0 ~-14 180_degrees`,
        },
        offsets: {
          West: { dx: -14, dy: 0, dz: -5 },
          South: { dx: -5, dy: 0, dz: 4 },
          East: { dx: 4, dy: 0, dz: -5 },
          North: { dx: -5, dy: 0, dz: -14 },
        },
      },
      {
        name: "Nether Portal 5",
        id: "nether_portal5",
        icon: "textures/ui/nether_portal5",
        commands: {
          West: `/structure load nether_portal5 ~-9 ~-1 ~-3 90_degrees`,
          South: `/structure load nether_portal5 ~-3 ~-1 ~5`,
          East: `/structure load nether_portal5 ~5 ~-1 ~-3 270_degrees`,
          North: `/structure load nether_portal5 ~-3 ~-1 ~-9 180_degrees`,
        },
        offsets: {
          West: { dx: -9, dy: -1, dz: -3 },
          South: { dx: -3, dy: -1, dz: 5 },
          East: { dx: 5, dy: -1, dz: -3 },
          North: { dx: -3, dy: -1, dz: -9 },
        },
      },
      {
        name: "Nether Portal 6",
        id: "nether_portal6",
        icon: "textures/ui/nether_portal6",
        commands: {
          West: `/structure load nether_portal6 ~-19 ~0 ~-6`,
          South: `/structure load nether_portal6 ~-6 ~0 ~5 270_degrees`,
          East: `/structure load nether_portal6 ~5 ~0 ~-6 180_degrees`,
          North: `/structure load nether_portal6 ~-6 ~0 ~-19 90_degrees`,
        },
        offsets: {
          West: { dx: -19, dy: 0, dz: -6 },
          South: { dx: -6, dy: 0, dz: 5 },
          East: { dx: 5, dy: 0, dz: -6 },
          North: { dx: -6, dy: 0, dz: -19 },
        },
      },
];
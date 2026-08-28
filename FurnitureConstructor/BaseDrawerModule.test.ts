import BaseDrawerModule from './BaseDrawerModule';

describe('BaseDrawerModule', () => {
  it('creates the standard 600 mm module with 4 drawers', () => {
    const module = new BaseDrawerModule();

    const model = module.build();

    expect(model.type).toBe('BaseDrawerModule');

    expect(model.parameters.width).toBe(600);
    expect(model.parameters.depth).toBe(600);
    expect(model.parameters.totalHeight).toBe(870);
    expect(model.parameters.plinthHeight).toBe(100);
    expect(model.parameters.bodyThickness).toBe(18);
    expect(model.parameters.drawerCount).toBe(4);
    expect(model.parameters.drawerSystem).toBe('Blum');

    expect(model.geometry.bodyHeight).toBe(770);
    expect(model.geometry.internalWidth).toBe(564);
    expect(model.geometry.internalDepth).toBe(582);
    expect(model.geometry.drawerZoneHeight).toBe(770);

    expect(model.drawers).toHaveLength(4);
    expect(model.parts).toHaveLength(4);

    expect(model.parts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'left-side',
          type: 'side',
          quantity: 1,
          thickness: 18,
        }),
        expect.objectContaining({
          id: 'right-side',
          type: 'side',
          quantity: 1,
          thickness: 18,
        }),
        expect.objectContaining({
          id: 'bottom',
          type: 'bottom',
          quantity: 1,
          thickness: 18,
        }),
        expect.objectContaining({
          id: 'plinth',
          type: 'plinth',
          quantity: 1,
          height: 100,
          thickness: 18,
        }),
      ]),
    );

    expect(model.validation.valid).toBe(true);
    expect(model.validation.errors).toHaveLength(0);
  });

  it('supports the factory standard 120 mm plinth', () => {
    const module = new BaseDrawerModule({
      plinthHeight: 120,
    });

    const model = module.build();

    expect(model.parameters.plinthHeight).toBe(120);
    expect(model.geometry.bodyHeight).toBe(750);

    expect(model.validation.valid).toBe(true);
    expect(model.validation.errors).toHaveLength(0);
  });

  it('creates a custom module width', () => {
    const module = new BaseDrawerModule({
      width: 800,
      drawerCount: 4,
    });

    const model = module.build();

    expect(model.parameters.width).toBe(800);
    expect(model.parameters.drawerCount).toBe(4);
    expect(model.geometry.internalWidth).toBe(764);
    expect(model.drawers).toHaveLength(4);

    expect(model.validation.valid).toBe(true);
  });

  it('rejects invalid plinth height', () => {
    const module = new BaseDrawerModule({
      plinthHeight: 110,
    });

    const model = module.build();

    expect(model.validation.valid).toBe(false);
    expect(model.validation.errors).toContain(
      'Factory standard plinth height must be 100 or 120 mm.',
    );
  });

  it('rejects invalid drawer count', () => {
    const module = new BaseDrawerModule({
      drawerCount: 0,
    });

    const model = module.build();

    expect(model.validation.valid).toBe(false);
    expect(model.validation.errors).toContain(
      'Drawer count must be a positive integer.',
    );
  });
});

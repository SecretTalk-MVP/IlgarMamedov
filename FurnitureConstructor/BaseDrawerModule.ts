/**
 * BaseDrawerModule
 *
 * Первый реальный мебельный модуль FurnitureConstructor.
 *
 * Назначение:
 * - параметрический нижний шкаф с ящиками;
 * - расчёт базовой геометрии;
 * - формирование конструктивной модели;
 * - подготовка модели для будущих 3D, чертежей,
 *   фурнитуры и производственного движка.
 *
 * Важно:
 * Точные размеры системы Blum пока не зашиваются сюда.
 * Позже они будут передаваться через Hardware Engine.
 */

export type DrawerSystem = 'Blum' | string;

export interface BaseDrawerModuleParameters {
  width: number;
  depth: number;
  totalHeight: number;
  plinthHeight: number;
  bodyThickness: number;
  drawerCount: number;
  drawerSystem: DrawerSystem;
}

export interface PartDefinition {
  id: string;
  type: 'side' | 'bottom' | 'rail' | 'back' | 'front' | 'plinth';
  width: number;
  height: number;
  depth: number;
  thickness: number;
  quantity: number;
}

export interface DrawerDefinition {
  id: string;
  index: number;
  availableHeight: number;
}

export interface BaseDrawerModuleModel {
  type: 'BaseDrawerModule';

  parameters: BaseDrawerModuleParameters;

  geometry: {
    bodyHeight: number;
    internalWidth: number;
    internalDepth: number;
    drawerZoneHeight: number;
  };

  parts: PartDefinition[];

  drawers: DrawerDefinition[];

  validation: {
    valid: boolean;
    errors: string[];
  };
}

export class BaseDrawerModule {
  private readonly parameters: BaseDrawerModuleParameters;

  constructor(
    parameters: Partial<BaseDrawerModuleParameters> = {},
  ) {
    this.parameters = {
      width: parameters.width ?? 600,
      depth: parameters.depth ?? 600,
      totalHeight: parameters.totalHeight ?? 870,
      plinthHeight: parameters.plinthHeight ?? 100,
      bodyThickness: parameters.bodyThickness ?? 18,
      drawerCount: parameters.drawerCount ?? 4,
      drawerSystem: parameters.drawerSystem ?? 'Blum',
    };
  }

  public getParameters(): BaseDrawerModuleParameters {
    return { ...this.parameters };
  }

  public build(): BaseDrawerModuleModel {
    const validation = this.validate();

    const {
      width,
      depth,
      totalHeight,
      plinthHeight,
      bodyThickness,
      drawerCount,
    } = this.parameters;

    const bodyHeight = totalHeight - plinthHeight;

    const internalWidth =
      width - bodyThickness * 2;

    const internalDepth =
      depth - bodyThickness;

    const drawerZoneHeight = bodyHeight;

    const drawerHeight =
      drawerCount > 0
        ? drawerZoneHeight / drawerCount
        : 0;

    const parts: PartDefinition[] = [
      {
        id: 'left-side',
        type: 'side',
        width: depth,
        height: bodyHeight,
        depth: bodyThickness,
        thickness: bodyThickness,
        quantity: 1,
      },

      {
        id: 'right-side',
        type: 'side',
        width: depth,
        height: bodyHeight,
        depth: bodyThickness,
        thickness: bodyThickness,
        quantity: 1,
      },

      {
        id: 'bottom',
        type: 'bottom',
        width: internalWidth,
        height: depth,
        depth: bodyThickness,
        thickness: bodyThickness,
        quantity: 1,
      },

      {
        id: 'plinth',
        type: 'plinth',
        width,
        height: plinthHeight,
        depth: bodyThickness,
        thickness: bodyThickness,
        quantity: 1,
      },
    ];

    const drawers: DrawerDefinition[] = Array.from(
      { length: drawerCount },
      (_, index) => ({
        id: `drawer-${index + 1}`,
        index: index + 1,
        availableHeight: drawerHeight,
      }),
    );

    return {
      type: 'BaseDrawerModule',

      parameters: this.getParameters(),

      geometry: {
        bodyHeight,
        internalWidth,
        internalDepth,
        drawerZoneHeight,
      },

      parts,

      drawers,

      validation,
    };
  }

  private validate(): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    const {
      width,
      depth,
      totalHeight,
      plinthHeight,
      bodyThickness,
      drawerCount,
    } = this.parameters;

    if (width <= bodyThickness * 2) {
      errors.push(
        'Module width is too small for the selected body thickness.',
      );
    }

    if (depth <= bodyThickness) {
      errors.push(
        'Module depth is too small for the selected body thickness.',
      );
    }

    if (totalHeight <= plinthHeight) {
      errors.push(
        'Total height must be greater than plinth height.',
      );
    }

    if (!Number.isInteger(drawerCount) || drawerCount < 1) {
      errors.push(
        'Drawer count must be a positive integer.',
      );
    }

    if (
      plinthHeight !== 100 &&
      plinthHeight !== 120
    ) {
      errors.push(
        'Factory standard plinth height must be 100 or 120 mm.',
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default BaseDrawerModule;

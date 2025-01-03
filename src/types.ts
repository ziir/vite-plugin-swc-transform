import type { FilterPattern as RollupFilterPattern } from "@rollup/pluginutils";
import type { Options as SWCOptions } from "@swc/core";

export interface Params {
  include?: RollupFilterPattern;
  exclude?: RollupFilterPattern;
  suppressLegacyDecoratorNoExplicitUDFCFWarning?: boolean;
  swcOptions?: SWCOptions;
}

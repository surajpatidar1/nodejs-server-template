import {configFactory} from "@/configs/config.load.js";

enum NodeType{
PRODUCTION = 'production',    
DEVELOPMENT = 'development',
TEST = 'test'
}

export const environmentService = {
  isProduction(): boolean {
    return configFactory.NODE_ENV === NodeType.PRODUCTION;
  },

  isDevelopment(): boolean {
    return configFactory.NODE_ENV === NodeType.DEVELOPMENT;
  },

  isTest(): boolean {
    return configFactory.NODE_ENV === NodeType.TEST;
  },
} as const;


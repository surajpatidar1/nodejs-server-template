let applicationReady = false;

export const setApplicationReady = (ready: boolean): void => {
  applicationReady = ready;
};

export const isApplicationReady = (): boolean => {
  return applicationReady;
};

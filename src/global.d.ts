// Here we do specifically need var instead of let or const,
// otherwise the declare statement doesn't work.
// eslint-disable-next-line no-var
declare var functionLocator: Record<string, unknown> | undefined;

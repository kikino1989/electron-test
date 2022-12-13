declare var PSPDFKit: any;

declare var _cdvElectronIpc: {
  exec: (success:(r) => void, error: (e) => void, serviceName: string, action: string, args: any) => Promise<any>,
  hasService: (serviceName: string) => boolean
};
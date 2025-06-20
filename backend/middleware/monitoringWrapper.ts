import { Request, Response, NextFunction } from 'express';

export const monitorRoute = (label: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log(`🛠️ Route accessed: ${label}`);
    next();
  };
};

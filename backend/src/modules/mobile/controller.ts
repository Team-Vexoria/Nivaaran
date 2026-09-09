import { Request, Response } from 'express';

export const mobileController = {
  nearby: async (req: Request, res: Response) => res.json({ nearby: [] }),
  submit: async (req: Request, res: Response) => res.json({ submitted: true }),
  evidence: async (req: Request, res: Response) => res.json({ evidence: true })
};


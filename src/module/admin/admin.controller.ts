import { Request, Response } from 'express';
import { adminService } from './admin.service.js';

export const updateImage = async (req: Request, res: Response) => {
  const userId = Number(req.user.sub);
  const { filename } = req.body;

  if (!filename) {
    return res.status(400).json({
      message: 'Filename is required.',
    });
  }

  const profileImage = await adminService.updateImage(userId, filename);

  return res.status(200).json({
    success: true,
    message: 'ProfileImage upadated successfully',
    profileImage,
  });
};

export const updateAdminDetails = async (req: Request, res: Response) => {
  const userId = Number(req.user.sub);
  const data = req.body;
  const user = await adminService.update(userId, data);

  return res.status(200).json({
    success: true,
    message: 'User updated successfully',
    user,
  });
};

export const changePassword = async (req: Request, res: Response) => {
  const userId = Number(req.user.sub);
  const data = req.body;
  return await adminService.changePassword(userId, data);
};

export const forgotPassword = async (req: Request, res: Response) => {
  const data = req.body;
  return await adminService.forgotPassword(data);
};

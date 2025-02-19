import prisma from "../lib/prisma"; 
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email, name, password } = req.body;

    try {
      const newUser = await prisma.user.create({
        data: { email, name, password },
      });

      return res.status(200).json(newUser);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create user" });
    }
  }

  if (req.method === "GET") {
    try {
      const users = await prisma.user.findMany();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  }
}

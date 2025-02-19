import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { agenda, visible, closed, options } = req.body;

    try {
      const newAgenda = await prisma.agenda.create({
        data: {
          agenda,
          visible,
          closed,
          options: {
            create: options.map((option: { value: number; label: string }) => ({
              value: option.value,
              label: option.label,
            })),
          },
        },
        include: { options: true },
      });

      return res.status(201).json(newAgenda);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create agenda" });
    }
  }

  res.setHeader("Allow", ["POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

import { Request, Response } from "express";
import {
  getPaperServiceSingle,
  postPaperService,
  getPaperServiceAll,
} from "../services/paper.service";
import { z } from "zod";

const idParamSchema = z.object({
  paper_id: z.uuid(),
});

export const getPaperControllerAll = async (req: Request, res: Response) => {
  const user_id = (req as any).user_id;
  try {
    const concepts = await getPaperServiceAll(user_id);
    res.status(200).json(concepts);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch your papers",
      devErr: error,
    });
  }
};

export const getPaperControllerSingle = async (req: Request, res: Response) => {
  const user_id = (req as any).user_id; // id getter

  const parsed = idParamSchema.safeParse(req.params);
  // req.params holds the url: http://localhost:3000/api/papers/57cfd510-9e0e-4cf1-b10a-ae79623a840b

  if (!parsed.success) {
    // if zod validation fails, return 400 e.g. type mismatch. expecting uuid, passed plain string will return 400
    return res.status(400).json({ error: "invalid paper id" });
  }

  // will get paper id inside parsed.data from zod
  const { paper_id } = parsed.data;

  try {
    // pass id to services
    const concepts = await getPaperServiceSingle(user_id, paper_id);

    if (!concepts) {
      // PURPOSE: if user tries to read data that isn't theirs, it will return a 404 data not found
      return res.status(404).json({
        error: "Item not found",
      });
    }

    res.status(200).json(concepts);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch your papers",
      devErr: error,
    });
  }
};

export const postPaperController = async (req: Request, res: Response) => {
  const user_id = (req as any).user_id; // requireAuth
  const { content } = req.body as {
    content: string;
  };

  if (!content || typeof content !== "string") {
    return res
      .status(400)
      .json({ error: "content is required and must be a text" });
  }
  try {
    console.log("data to post are: ", user_id, content);
    const concepts = await postPaperService(user_id, content);
    res.status(200).json(concepts);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch your papers",
      devErr: error,
    });
  }
};

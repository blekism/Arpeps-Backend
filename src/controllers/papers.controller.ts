import { Request, Response } from "express";
import { getPaperService, postPaperService } from "../services/paper.service";

export const getPaperController = async (req: Request, res: Response) => {
  const user_id = (req as any).user_id;
  try {
    const concepts = await getPaperService(user_id);
    res.status(200).json(concepts);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch your papers",
      devErr: error,
    });
  }
};

export const postPaperController = async (req: Request, res: Response) => {
  const user_id = (req as any).user_id;
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

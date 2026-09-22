import { Request, Response } from "express";
import { Item } from "../types";
import { getAllConcepts } from "../services/items.service";
import { getPaperServiceAll } from "../services/paper.service";

let items: Item[] = [{ id: 1, name: "Example" }];

export const getConcepts = async (req: Request, res: Response) => {
  try {
    const concepts = await getPaperServiceAll(
      "f2dcbc0e-f2ed-413d-b4a7-cad26fc469ac",
    );
    res.status(200).json(concepts);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch concepts",
      devErr: error,
    });
  }
};

export const createItem = (req: Request, res: Response) => {
  const { name } = req.body as { name?: string };
  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }
  const newItem: Item = { id: Date.now(), name };
  items.push(newItem);
  res.status(201).json(newItem);
};

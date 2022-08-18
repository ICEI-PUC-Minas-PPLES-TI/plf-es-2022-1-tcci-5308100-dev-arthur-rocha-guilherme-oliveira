import { File } from "./file";
export class Folder {
  constructor(
    public path: string,
    public folders: Folder[],
    public files: File[]
  ) {}
}

export function getMockedFolder(): Folder {
  const otherFile = new File("other-file.ts", [1, 2, 3]);
  const otherFolder = new Folder("other-folder", [], [otherFile]);

  const mainFile = new File("test.js", [7, 11, 16]);
  const root = new Folder("", [otherFolder], [mainFile]);
  return root;
}

export const CLI_COMMAND_NAME = "wbrand";
export const CLI_PROCESS_NAME = "wbrand-cli";

interface ProcessTitleTarget {
  title: string;
}

export const setCliProcessTitle = (
  target: ProcessTitleTarget = process,
): void => {
  target.title = CLI_PROCESS_NAME;
};

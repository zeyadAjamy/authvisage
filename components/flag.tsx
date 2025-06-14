import flags from "react-phone-number-input/flags";
import type { FlagProps } from "react-phone-number-input";

export const FlagComponent = ({ country, countryName }: FlagProps) => {
  const Flag = flags[country];
  return (
    <span className="bg-foreground/20 flex h-4 w-6 overflow-hidden rounded-sm [&_svg:not([class*='size-'])]:size-full">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

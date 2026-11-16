import {
  FaBell,
  FaBookmark,
  FaChartLine,
  FaClipboardCheck,
  FaComments,
  FaImages,
  FaPenNib,
  FaPlus,
  FaUser,
} from "react-icons/fa6";
import type { IconType } from "react-icons";

/** The icons the dashboard menu can show. */
export type NavIconName = "posts" | "new" | "media" | "comments" | "review" | "analytics" | "bell" | "bookmark" | "account";

/** Which picture goes with which name. */
const ICONS: Record<NavIconName, IconType> = {
  posts: FaPenNib,
  new: FaPlus,
  media: FaImages,
  comments: FaComments,
  review: FaClipboardCheck,
  analytics: FaChartLine,
  bell: FaBell,
  bookmark: FaBookmark,
  account: FaUser,
};

/** One menu icon, coloured by the surrounding text colour. */
export function NavIcon({ name }: { name: NavIconName }) {
  const Icon = ICONS[name];
  return <Icon aria-hidden="true" />;
}

import { Link } from "react-router-dom";
import { useAuthor } from "../../lib/api/author";
import { mediaUrl } from "../../lib/media";
import { Avatar } from "../ui";
import "./AuthorBox.css";

/**
 * "Written by" card at the end of an article. It links to the author's page and
 * fills in the photo and bio once the profile loads (the name shows right away).
 */
export function AuthorBox({ name, username }: { name: string; username: string }) {
  const { data: author } = useAuthor(username);

  return (
    <aside className="author-box" aria-label="About the author">
      <Avatar name={name} src={mediaUrl(author?.avatar)} size={56} />
      <div>
        <p className="author-box__label">Written by</p>
        <p className="author-box__name">
          <Link to={`/author/${username}`}>{name}</Link>
        </p>
        {author?.bio && <p className="author-box__bio">{author.bio}</p>}
      </div>
    </aside>
  );
}

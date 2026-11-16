import { useState, type KeyboardEvent } from "react";
import { Button, useToast } from "../ui";
import { api } from "../../lib/api/client";
import { errorMessage } from "../../lib/api/errors";
import type { Tag } from "../../lib/api/blog";
import { blogKeys } from "../../lib/api/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import "./TagAdder.css";

/**
 * A small box for adding a brand-new tag while writing.
 * The server returns the existing tag if the name is already taken,
 * so a writer can never make a duplicate.
 */
export function TagAdder({ onAdded }: { onAdded: (tag: Tag) => void }) {
  const [name, setName] = useState("");
  const toast = useToast();
  const client = useQueryClient();

  const create = useMutation({
    mutationFn: (value: string) => api.post<Tag>("/blog/tags/", { name: value }),
    onSuccess: (tag) => {
      void client.invalidateQueries({ queryKey: blogKeys.tags });
      onAdded(tag);
      setName("");
    },
    onError: (caught) => toast.error(errorMessage(caught, "Could not add that tag.")),
  });

  /** Send the new tag to the server (ignored when the box is empty). */
  function add() {
    const value = name.trim();
    if (value) create.mutate(value);
  }

  /** Pressing Enter adds the tag instead of submitting the whole post form. */
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      add();
    }
  }

  return (
    <div className="tag-adder">
      <input
        type="text"
        className="field__input"
        placeholder="Add a new tag"
        aria-label="New tag name"
        maxLength={40}
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={onKeyDown}
      />
      <Button type="button" size="sm" variant="secondary" onClick={add} loading={create.isPending} disabled={!name.trim()}>
        Add tag
      </Button>
    </div>
  );
}

import { User } from "@/state/api";
import Image from "next/image";
import React from "react";

type Props = {
  user: User;
};

const UserCard = ({ user }: Props) => {
  return (
    <div className="flex items-center rounded border p-4 shadow">
      {user.profilePictureUrl ? (
        <Image
          src={`/${user.profilePictureUrl}`}
          alt={user.username}
          width={32}
          height={32}
          className="rounded-full"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
          {user.username[0].toUpperCase()}
        </div>
      )}
      <div className="ml-4">
        <h3 className="font-semibold">{user.username}</h3>
        <p className="text-sm text-gray-500">Team ID: {user.teamId || "None"}</p>
      </div>
    </div>
  );
};

export default UserCard;

import { Input, FormLabel, Button } from "@chakra-ui/react";
import { useViewerConnection, useViewerRecord } from "@self.id/react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

const ProfileForm = ({ profile, isLoading, onSave }) => {
  const { register, handleSubmit } = useForm({ defaultValues: profile });

  console.log("profile", profile, isLoading);
  return (
    <form onSubmit={handleSubmit(onSave)}>
      <FormLabel>
        Currently set to: {profile?.name}
        <Input {...register("name")} />
      </FormLabel>
      <Button type="submit" isLoading={isLoading}>
        Save
      </Button>
    </form>
  );
};

export default function UserProfile() {
  const { did } = useParams();
  const [{ selfID }]: any = useViewerConnection();
  const profile = useViewerRecord("basicProfile");
  return (
    <div>
      <h3>User profile</h3>
      <pre>{did}</pre>
      {selfID?.id === did ? (
        <ProfileForm
          profile={profile.content}
          isLoading={profile.isLoading || profile.isMutating}
          onSave={profile.set}
        />
      ) : null}
    </div>
  );
}

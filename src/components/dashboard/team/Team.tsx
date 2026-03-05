import { TeamMember } from "@/app/[locale]/dashboard/nursery/team/page";
import { TeamCard } from "./TeamCard";
import EmptyState from "@/components/common/EmptyState";
import { useAuthUser } from "@/store/authStore";
import { useRouter } from "@/i18n/navigation";

const Team = ({
  members,
  branchId,
}: {
  members: TeamMember[];
  branchId: number;
}) => {
  const router = useRouter();
  const user = useAuthUser();
  const role = user?.role;

  if (members.length === 0) {
    return (
      <EmptyState
        icon="👥"
        size="lg"
        primaryAction={{
          label: "Add Team Member",
          onClick: () => {
            if (!role) return;
            router.push(`/dashboard/${role}/team/add?branch_id=${branchId}`);
          },
        }}
        translationKey="dashboard.emptyStates.team"
      />
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(12rem,13rem))] gap-x-4 gap-y-5.5">
      {members.map((member, index) => (
        <TeamCard key={index} {...member} />
      ))}
    </div>
  );
};

export default Team;

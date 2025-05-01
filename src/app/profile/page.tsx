import { getUserProfile } from '@/actions/user-profile.action';
import UserProfilePageDataContent from './UserProfilePageDataContent';

export default async function Profile() {
  const profile = await getUserProfile();

  if (!profile.success) {
    return <div>Error loading profile</div>;
  }

  return <UserProfilePageDataContent userProfile={profile.data} />;
}

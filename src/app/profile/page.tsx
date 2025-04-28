import { getUserProfile } from '@/actions/user-profile.action';
import ErrorPage from '../error/page';
import UserProfilePageDataContent from './UserProfilePageDataContent';

export default async function Profile() {
  const profile = await getUserProfile();

  if (!profile.success) {
    console.error('Error fetching user profile:', profile.error);
    return <ErrorPage />;
  }

  return <UserProfilePageDataContent userProfile={profile.data} />;
}

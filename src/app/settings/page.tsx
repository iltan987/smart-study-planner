import { getUserProfile } from '@/actions/user-profile.action';
import SettingsPageContent from './SettingsPageContent';

export default async function SettingsPage() {
  const profile = await getUserProfile();

  if (!profile.success) {
    return <div>Error loading profile</div>;
  }

  console.log(profile.data.profile.dob);

  return <SettingsPageContent userProfile={profile.data} />;
}

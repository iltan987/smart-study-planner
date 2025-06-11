'use client';

import { updateUserProfileAndEducation } from '@/actions/user.action';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type {
  UpdateUserProfileFormInput,
  UserProfileInput,
} from '@/schemas/settings.schema';
import { updateUserProfileFormSchema } from '@/schemas/settings.schema';
import type { YearMonthDate } from '@/schemas/time.schema';
import {
  avatarBackgroundColors,
  avatarTextColors,
  defaultAvatarTextColor,
  getInitials,
} from '@/utils/avatar.util';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Gender } from '@prisma/client';
import { format } from 'date-fns';
import {
  Laptop,
  Loader2,
  Moon,
  PlusCircle,
  Save,
  Sun,
  Trash2,
  XIcon,
} from 'lucide-react';
import type { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

type InitialSettingsUserData = {
  name: string;
  UserProfile: {
    birthDate: Date | null;
    gender: Gender | null;
    nationality: string | null;
    languages: string[];
    id: string;
    EducationInfo: {
      id: string;
      institution: string;
      degree: string;
      fieldOfStudy: string;
      startDate: Date;
      endDate: Date | null;
      cgpa: number | null;
      gradingSystem: string | null;
    }[];
  } | null;
  email: string;
};

interface SettingsPageContentProps {
  initialSessionData: User;
  initialUserData: InitialSettingsUserData;
}

export default function SettingsPageContent({
  initialSessionData,
  initialUserData,
}: SettingsPageContentProps) {
  const { update: updateSession } = useSession({ required: true });
  const { theme, setTheme } = useTheme();

  const profileAndEducationForm = useForm<UpdateUserProfileFormInput>({
    resolver: zodResolver(updateUserProfileFormSchema),
    defaultValues: {
      name: initialUserData.name || '',
      birthDate: initialUserData.UserProfile?.birthDate
        ? format(initialUserData.UserProfile?.birthDate, 'yyyy-MM-dd')
        : '',
      gender: initialUserData.UserProfile?.gender || '',
      nationality: initialUserData.UserProfile?.nationality || '',
      languages: initialUserData.UserProfile?.languages || [],
      educationHistory: initialUserData.UserProfile?.EducationInfo
        ? initialUserData.UserProfile.EducationInfo.map((edu) => ({
            ...edu,
            startDate: format(edu.startDate, 'yyyy-MM-dd'),
            endDate: edu.endDate ? format(edu.endDate, 'yyyy-MM-dd') : '',
            cgpa: edu.cgpa !== null ? String(edu.cgpa) : '',
            gradingSystem: edu.gradingSystem || '',
          }))
        : [],
    },
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control: profileAndEducationForm.control,
    name: 'educationHistory',
    keyName: 'fieldId',
  });

  const [currentLanguage, setCurrentLanguage] = useState('');

  const { initials, selectedBgColor, selectedTextColor } = useMemo(() => {
    const name = initialSessionData.name;
    const localInitials = getInitials(name);
    const charCodeSum = name
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const bgColor =
      avatarBackgroundColors[charCodeSum % avatarBackgroundColors.length] ||
      'bg-gray-200';
    const textColor = avatarTextColors[bgColor] || defaultAvatarTextColor;
    return {
      initials: localInitials,
      selectedBgColor: bgColor,
      selectedTextColor: textColor,
    };
  }, [initialSessionData.name]);

  const onSubmitProfileAndEducation = async (
    data: UpdateUserProfileFormInput
  ) => {
    toast.info('Updating profile and education details...');

    const {
      name,
      birthDate,
      gender,
      nationality,
      languages,
      educationHistory,
    } = data;

    let birthDateObj: YearMonthDate | undefined;

    if (birthDate !== '') {
      const birthDateParts = birthDate.split('-').map(Number);
      birthDateObj = {
        year: birthDateParts[0],
        monthIndex: birthDateParts[1] - 1,
        date: birthDateParts[2],
      };
    }

    // Prepare data for submission
    const payload: UserProfileInput = {
      name,
      ...(birthDateObj ? { birthDate: birthDateObj } : undefined),
      gender: gender === '' ? null : gender,
      nationality: nationality === '' ? null : nationality,
      languages: languages.filter((lang) => lang.trim() !== ''),
      educationHistory: educationHistory.map((edu) => {
        const { startDate, endDate, cgpa, gradingSystem, ...rest } = edu;
        const numericCgpa =
          typeof cgpa === 'string' && cgpa.trim() !== ''
            ? parseFloat(cgpa)
            : null;

        return {
          ...rest,
          startDate: new Date(startDate),
          ...(endDate
            ? {
                endDate: new Date(endDate),
              }
            : undefined),
          cgpa:
            numericCgpa !== null && !isNaN(numericCgpa) ? numericCgpa : null,
          ...(gradingSystem ? { gradingSystem } : undefined),
        };
      }),
    };

    const result = await updateUserProfileAndEducation(payload);

    if (result.success) {
      toast.success(result.message || 'Profile updated successfully!');
      if (initialSessionData.name !== name) {
        // Update session locally if name changed
        updateSession({ name: payload.name });
        initialSessionData.name = payload.name; // Keep local initial data in sync
      }
      profileAndEducationForm.reset(data); // Reset form with new defaults, maintaining current values
    } else {
      if (typeof result.error === 'string') {
        toast.error(result.error);
      } else if (result.error) {
        const fieldErrors = result.error.fieldErrors;
        for (const fieldName in fieldErrors) {
          if (Object.prototype.hasOwnProperty.call(fieldErrors, fieldName)) {
            const message =
              fieldErrors[fieldName as keyof UserProfileInput]?.join(', ');
            profileAndEducationForm.setError(
              fieldName as keyof UpdateUserProfileFormInput,
              {
                type: 'server',
                message: message,
              }
            );
          }
        }
        if (result.error.formErrors.length > 0) {
          toast.error(result.error.formErrors.join(', '));
        } else {
          toast.error('Failed to update profile. Please check the errors.');
        }
      }
    }
  };

  const handleAddLanguage = () => {
    if (currentLanguage.trim() !== '') {
      const currentLanguages =
        profileAndEducationForm.getValues('languages') || [];
      if (!currentLanguages.includes(currentLanguage.trim())) {
        profileAndEducationForm.setValue(
          'languages',
          [...currentLanguages, currentLanguage.trim()],
          { shouldValidate: true, shouldDirty: true }
        );
      }
      setCurrentLanguage('');
    }
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    const currentLanguages =
      profileAndEducationForm.getValues('languages') || [];
    profileAndEducationForm.setValue(
      'languages',
      currentLanguages.filter((lang) => lang !== languageToRemove),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  const handleAddEducationEntry = () => {
    appendEducation(
      {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        cgpa: '',
        gradingSystem: '',
      },
      { shouldFocus: true }
    );
  };

  return (
    <div className="container px-3 mx-auto py-8 max-w-4xl md:py-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 rounded-lg">
            <AvatarFallback
              className={cn(
                'rounded-lg text-xl',
                selectedBgColor,
                selectedTextColor
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{initialSessionData.name}</h1>
            <p className="text-muted-foreground">{initialUserData.email}</p>
          </div>
        </div>
      </div>

      <Form {...profileAndEducationForm}>
        <form
          onSubmit={profileAndEducationForm.handleSubmit(
            onSubmitProfileAndEducation
          )}
        >
          <Tabs defaultValue="profile" className="space-y-6 px-3">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
              <TabsTrigger value="profile">Profile Details</TabsTrigger>
              <TabsTrigger value="education">Education History</TabsTrigger>
              <TabsTrigger value="application">
                Application Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal & Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal details. Your email address, used for
                    login, cannot be changed here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={profileAndEducationForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Separator />
                  <h3 className="text-lg font-medium">Profile Specifics</h3>
                  <FormField
                    control={profileAndEducationForm.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileAndEducationForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => field.onChange('')}
                                className="h-8 w-8"
                                aria-label="Clear gender selection"
                                title="Clear gender selection"
                                disabled={!field.value}
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                            <SelectItem value="PREFER_NOT_TO_SAY">
                              Prefer not to say
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileAndEducationForm.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality</FormLabel>
                        <FormControl>
                          <Input placeholder="Your nationality" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel>Languages Spoken</FormLabel>
                    <Controller
                      name="languages"
                      control={profileAndEducationForm.control}
                      render={({ field }) => (
                        <>
                          {field.value.length > 0 ? (
                            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                              {field.value.map((lang, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {lang}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLanguage(lang)}
                                    className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                                    aria-label={`Remove ${lang}`}
                                  >
                                    <XIcon className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="p-2 border rounded-md min-h-[40px] text-sm text-muted-foreground">
                              No languages added yet.
                            </p>
                          )}
                        </>
                      )}
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        placeholder="Add a language"
                        value={currentLanguage}
                        onChange={(e) => setCurrentLanguage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddLanguage();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddLanguage}
                        variant="outline"
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                    <FormDescription>
                      Add languages you speak. Press Enter or click Add.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education">
              <Card>
                <CardHeader>
                  <CardTitle>Education History</CardTitle>
                  <CardDescription>
                    Provide or update your educational background. Add, edit, or
                    remove entries as needed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {educationFields.map((item, index) => {
                    const institution = profileAndEducationForm.watch(
                      `educationHistory.${index}.institution`
                    );
                    const degree = profileAndEducationForm.watch(
                      `educationHistory.${index}.degree`
                    );
                    let entryTitle = `Education Entry ${index + 1}`;
                    if (institution && degree) {
                      entryTitle = `${institution} - ${degree}`;
                    } else if (institution) {
                      entryTitle = institution;
                    } else if (degree) {
                      entryTitle = degree;
                    } else if (!item.id) {
                      // New entry not yet filled
                      entryTitle = 'New Education Entry';
                    }

                    return (
                      <Card
                        key={item.fieldId}
                        className="p-4 border rounded-md shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4
                            className="font-semibold text-md truncate"
                            title={entryTitle}
                          >
                            {entryTitle}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeEducation(index)}
                            aria-label={`Remove education entry ${index + 1}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="space-y-4">
                          <FormField
                            control={profileAndEducationForm.control}
                            name={`educationHistory.${index}.institution`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Institution</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="University Name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileAndEducationForm.control}
                              name={`educationHistory.${index}.degree`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Degree</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., Bachelor of Science"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileAndEducationForm.control}
                              name={`educationHistory.${index}.fieldOfStudy`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Field of Study</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., Computer Science"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileAndEducationForm.control}
                              name={`educationHistory.${index}.startDate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileAndEducationForm.control}
                              name={`educationHistory.${index}.endDate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>End Date (Optional)</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileAndEducationForm.control}
                              name={`educationHistory.${index}.cgpa`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CGPA (Optional)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="e.g., 3.85"
                                      step="0.01"
                                      {...field}
                                      value={field.value ?? ''}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (
                                          value === '' ||
                                          !isNaN(parseFloat(value))
                                        ) {
                                          field.onChange(value);
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileAndEducationForm.control}
                              name={`educationHistory.${index}.gradingSystem`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Grading System (Optional)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., 4.0 Scale, Percentage"
                                      {...field}
                                      value={field.value ?? ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={handleAddEducationEntry}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Education Entry
                  </Button>
                  {profileAndEducationForm.formState.errors.educationHistory &&
                    !Array.isArray(
                      profileAndEducationForm.formState.errors.educationHistory
                    ) && (
                      <p className="text-sm font-medium text-destructive">
                        {
                          profileAndEducationForm.formState.errors
                            .educationHistory.message
                        }
                      </p>
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="application">
              <Card>
                <CardHeader>
                  <CardTitle>Application Settings</CardTitle>
                  <CardDescription>
                    Personalize the application&apos;s appearance, such as
                    selecting a color theme.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme-select">Theme</Label>
                    <Select
                      value={theme || 'system'} // Use theme from useTheme
                      onValueChange={(value) => {
                        setTheme(value as 'light' | 'dark' | 'system');
                      }}
                    >
                      <SelectTrigger id="theme-select">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            <span>Light</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            <span>Dark</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Laptop className="h-4 w-4" />
                            <span>System</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred application theme. This is saved
                      automatically.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              disabled={
                profileAndEducationForm.formState.isSubmitting ||
                (!profileAndEducationForm.formState.isDirty &&
                  !profileAndEducationForm.formState.isSubmitted)
              }
              size="lg"
            >
              {profileAndEducationForm.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving All
                  Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" /> Save All Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

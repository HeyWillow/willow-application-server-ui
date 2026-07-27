import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import useSWR from 'swr';
import ClientCard from '../components/ClientCard';
import LeftMenu from '../components/LeftMenu';
import { fetcher } from '../misc/fetchers';
import { AdvancedSettings, Client, Release } from '../misc/model';
import { OnboardingContext } from './_app';

const Home: NextPage = () => {
  const router = useRouter();
  const { data: clientData, error: clientError } = useSWR<Client[]>('/api/client', fetcher, {
    refreshInterval: 5000,
  }); //we refresh clients every 5 seconds so we can detect offline, new, & updated clients
  const onboardingContext = React.useContext(OnboardingContext);
  const { data: releaseData, error: releaseError } = useSWR<Release[]>('/api/release?type=was');
  const { data: advancedSettings } = useSWR<AdvancedSettings>('/api/config?type=config');
  const [latestRelease, setLatestRelease] = React.useState<Release | undefined>(undefined);
  const incompatibleRelease = releaseData?.find(
    (release) =>
      release.was_compatible === false &&
      (!release.prerelease || advancedSettings?.show_prereleases)
  );

  React.useEffect(() => {
    setLatestRelease((releaseData?.filter((release) => release.latest) ?? [undefined])[0]);
  }, [releaseData]);

  if (!onboardingContext.isOnboardingComplete) {
    router.replace('/config');
    return <></>;
  }
  return (
    <LeftMenu>
      <Grid container spacing={2}>
        {incompatibleRelease && (
          <Grid item xs={12}>
            <Alert severity="warning">
              <AlertTitle>New Willow release available</AlertTitle>
              Willow {incompatibleRelease.name}, featuring the new &quot;Hey Willow&quot; wake word,
              requires SR model OTA support from a newer Willow Application Server. Upgrade WAS to
              be able to install the new Willow release.
            </Alert>
          </Grid>
        )}
        {clientData?.map((client: any) => (
          <React.Fragment key={client.hostname}>
            <Grid item md={4} sm={6} xs={12} lg={3}>
              <ClientCard
                client={client}
                latestReleaseAsset={
                  (latestRelease?.assets?.filter(
                    (r) => r.platform == client.platform && r.was_url
                  ) ?? [undefined])[0] ?? undefined
                }
                latestReleaseName={latestRelease?.name}></ClientCard>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    </LeftMenu>
  );
};

export default Home;

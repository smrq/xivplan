import { makeStyles, Spinner, Toaster, tokens } from '@fluentui/react-components';
import React, { PropsWithChildren, Suspense } from 'react';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { createHashRouter, Outlet, RouterProvider, useLoaderData } from 'react-router-dom';
import { DirtyProvider } from './DirtyProvider';
import { FileOpenPage } from './FileOpenPage';
import { HelpProvider } from './HelpProvider';
import { legacyLoader as mainLegacyLoader, loader as mainLoader, MainPage } from './MainPage';
import { Scene } from './scene';
import { SceneProvider } from './SceneProvider';
import { SiteHeader } from './SiteHeader';
import { ThemeProvider } from './ThemeProvider';
import { useFileLoaderDropTarget } from './useFileLoader';
import { HotkeyScopes } from './useHotkeys';
import { loader as viewLoader, ViewPage } from './ViewPage';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'grid',
        gridTemplateColumns: `auto minmax(400px, auto) 1fr`,
        gridTemplateRows: `min-content min-content 1fr`,
        gridTemplateAreas: `
                "header     header  header"
                "left-panel steps   right-panel"
                "left-panel content right-panel"
            `,

        background: tokens.colorNeutralBackground3,
    },
    header: {
        gridArea: 'header',
    },

    loading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: tokens.colorNeutralBackground3,
    },
});

const BaseProviders: React.FC<PropsWithChildren<{ initialScene?: Scene }>> = ({ children, initialScene }) => {
    return (
        <HotkeysProvider initiallyActiveScopes={[HotkeyScopes.Default, HotkeyScopes.AlwaysEnabled]}>
            <HelpProvider>
                <SceneProvider initialScene={initialScene}>
                    <DirtyProvider>
                        {children}
                    </DirtyProvider>
                </SceneProvider>
            </HelpProvider>
        </HotkeysProvider>
    );
};

const LoadingFallback: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.loading}>
            <p>Fetching plan</p>
            <Spinner />
        </div>
    );
};

const Layout: React.FC = () => {
    return (
        <ThemeProvider>
            <Suspense fallback={<LoadingFallback />}>
                <Outlet />
            </Suspense>
        </ThemeProvider>
    );
};

const Page: React.FC<{ page: React.FC }> = ({ page }) => {
    const { initialScene } = useLoaderData() ?? {};

    return (
        <BaseProviders initialScene={initialScene}>
            <PageContent page={page} />
        </BaseProviders>
    );
};

const PageContent: React.FC<{ page: React.FC }> = ({ page: Page }) => {
    const classes = useStyles();
    const { onDragOver, onDrop, renderModal } = useFileLoaderDropTarget();

    return (
        <>
            <div className={classes.root} onDragOver={onDragOver} onDrop={onDrop}>
                <Toaster position="top" />
                <SiteHeader className={classes.header} />
                <Page />
            </div>
            {renderModal()}
        </>
    );
};

const router = createHashRouter([
    {
        element: <Layout />,
        children: [
            {
                path: '/view/:provider?/:data',
                element: <Page page={ViewPage} />,
                loader: viewLoader,
            },
            {
                path: '/plan/:provider?/:data',
                element: <Page page={MainPage} />,
                loader: mainLoader,
            },
            {
                path: '/open',
                element: <Page page={FileOpenPage} />,
            },
            {
                path: '/',
                index: true,
                element: <Page page={MainPage} />,
                loader: mainLegacyLoader,
            },
        ]
    }
]);

export const App: React.FC = () => {
    return <RouterProvider router={router} />;
};

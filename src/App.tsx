import { classNamesFunction, Theme, useTheme } from '@fluentui/react';
import { IStyle } from '@fluentui/style-utilities';
import React, { PropsWithChildren } from 'react';
import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom';
import { CommandBarProvider } from './CommandBarProvider';
import { HelpProvider } from './HelpProvider';
import { MainPage, loader as mainLoader, legacyLoader as mainLegacyLoader } from './MainPage';
import { ViewPage, loader as viewLoader } from './ViewPage';
import { SiteHeader } from './SiteHeader';
import { ThemeProvider } from './ThemeProvider';

interface IAppStyles {
    root: IStyle;
    header: IStyle;
}

const getClassNames = classNamesFunction<Theme, IAppStyles>();

function getStyles(theme: Theme): IAppStyles {
    return {
        root: {
            colorScheme: theme.isInverted ? 'dark' : 'light',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'grid',
            gridTemplateColumns: `auto minmax(400px, auto) 1fr`,
            gridTemplateRows: `min-content auto 1fr`,
            gridTemplateAreas: `
                "header     header  header"
                "left-panel steps   right-panel"
                "left-panel content right-panel"
            `,
        },
        header: {
            gridArea: 'header',
        },
    };
}

export const BaseProviders: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <ThemeProvider>
            <HelpProvider>
                <CommandBarProvider>{children}</CommandBarProvider>
            </HelpProvider>
        </ThemeProvider>
    );
};

const Layout: React.FC = () => {
    const theme = useTheme();
    const classNames = getClassNames(getStyles, theme);

    return (
        <div className={classNames.root}>
            <SiteHeader className={classNames.header} />
            <Outlet />
        </div>
    );
};

const router = createHashRouter([
    {
        element: <Layout />,
        children: [
            {
                path: '/view/:provider?/:data',
                element: <ViewPage />,
                loader: viewLoader,
            },
            {
                path: '/plan/:provider?/:data',
                element: <MainPage />,
                loader: mainLoader,
            },
            {
                path: '/',
                index: true,
                element: <MainPage />,
                loader: mainLegacyLoader,
            },
        ]
    }
]);

export const App: React.FC = () => {
    return (
        <BaseProviders>
            <RouterProvider router={router} />
        </BaseProviders>
    );
};

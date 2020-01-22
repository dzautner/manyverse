/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {View, ActivityIndicator, Platform} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {IndicatorViewPager} from 'rn-viewpager';
import {FloatingAction} from 'react-native-floating-action';
import {MenuProvider} from 'react-native-popup-menu';
import {IFloatingActionProps as FabProps} from 'react-native-floating-action';
import {styles as globalStyles} from '../../global-styles/styles';
import BetterPagerTabIndicator from '../../components/BetterPagerTabIndicator';
import {styles, iconProps} from './styles';
import {State} from './model';
import {Palette} from '../../global-styles/palette';

const iconData = {
  public: {
    name: 'bulletin-board',
    accessible: true,
    accessibilityLabel: 'Public Tab Button',
  },

  connections: {
    accessible: true,
    accessibilityLabel: 'Connections Tab Button',
  },
};

function renderPublicIcon(numOfPublicUpdates: number) {
  return {
    normal: h(View, [
      h(Icon, {...iconProps.tab, ...iconData.public}),
      h(View, {
        style:
          numOfPublicUpdates > 10
            ? styles.updatesCoverNone
            : numOfPublicUpdates > 0
            ? styles.updatesCoverSome
            : styles.updatesCoverAll,
      }),
    ] as any),

    selected: h(View, [
      h(Icon, {...iconProps.tabSelected, ...iconData.public}),
      h(View, {
        style:
          numOfPublicUpdates > 10
            ? styles.updatesCoverNone
            : numOfPublicUpdates > 0
            ? styles.updatesCoverSome
            : styles.updatesCoverAll,
      }),
    ] as any),
  };
}

function renderConnectionsIcon(
  isSyncing: boolean,
  state: State['connectionsTab'],
) {
  return {
    normal: h(View, [
      h(Icon, {
        ...iconProps.tab,
        ...iconData.connections,
        name:
          !state?.bluetoothEnabled &&
          !state?.internetEnabled &&
          !state?.lanEnabled
            ? 'network-off-outline'
            : (state?.peers || []).filter(p => p[1].state === 'connected')
                .length > 0
            ? 'check-network-outline'
            : 'network-outline',
      }),
      isSyncing && Platform.OS === 'android'
        ? h(ActivityIndicator, {
            animating: true,
            size: 19,
            style: styles.syncingProgressBar,
            color: Palette.backgroundBrandStrong,
          })
        : null,
    ]),

    selected: h(View, [
      h(Icon, {
        ...iconProps.tabSelected,
        ...iconData.connections,
        name:
          !state?.bluetoothEnabled &&
          !state?.internetEnabled &&
          !state?.lanEnabled
            ? 'network-off'
            : (state?.peers || []).filter(p => p[1].state === 'connected')
                .length > 0
            ? 'check-network'
            : 'network',
      }),
      isSyncing && Platform.OS === 'android'
        ? h(ActivityIndicator, {
            animating: true,
            size: 19,
            style: styles.syncingProgressBar,
            color: Palette.colors.blue4,
          })
        : null,
    ]),
  };
}

function renderTabs(
  state: State,
  publicTabVDOM: ReactElement<any>,
  metadataTabVDOM: ReactElement<any>,
) {
  return h(
    IndicatorViewPager,
    {
      style: styles.indicatorViewPager,
      indicator: h(BetterPagerTabIndicator, {
        sel: 'tabs',
        style: [globalStyles.noMargin, {elevation: 3}],
        itemStyle: styles.tabItem,
        selectedItemStyle: styles.tabItemSelected,
        tabs: [
          renderPublicIcon(state.numOfPublicUpdates),
          renderConnectionsIcon(state.isSyncing, state.connectionsTab),
        ],
      }),
    },
    [
      h(View, {style: styles.pageContainer}, [publicTabVDOM]),
      h(View, {style: styles.pageContainer}, [metadataTabVDOM]),
    ],
  );
}

export default function view(
  state$: Stream<State>,
  fabProps$: Stream<FabProps>,
  topBarVDOM$: Stream<ReactElement<any>>,
  publicTabVDOM$: Stream<ReactElement<any>>,
  metadataTabVDOM$: Stream<ReactElement<any>>,
) {
  return xs
    .combine(
      state$,
      fabProps$,
      topBarVDOM$,
      publicTabVDOM$.startWith(h(View)),
      metadataTabVDOM$.startWith(h(View)),
    )
    .map(([state, fabProps, topBarVDOM, publicTabVDOM, metadataTabVDOM]) =>
      h(MenuProvider, {customStyles: {backdrop: styles.menuBackdrop}}, [
        h(View, {style: styles.root}, [
          topBarVDOM,
          renderTabs(state, publicTabVDOM, metadataTabVDOM),
          h(FloatingAction, fabProps),
        ]),
      ]),
    );
}

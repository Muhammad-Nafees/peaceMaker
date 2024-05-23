import * as React from 'react';
import { CommonActions, StackActions, NavigationContainerRef } from '@react-navigation/native';

// TODO: we need change this any to the correctly types from our stacks
const navigationRef = React.createRef<NavigationContainerRef<any>>();
const routeNameRef: React.MutableRefObject<NavigationContainerRef<any> | null> = React.createRef();

function navigate(name: string, params?: any) {
	navigationRef.current?.navigate(name, params);
}

function back() {
	navigationRef.current?.dispatch(CommonActions.goBack());
}

function replace(name: string, params: any) {
	navigationRef.current?.dispatch(StackActions.replace(name, params));
}

function popToTop() {
	navigationRef.current?.dispatch(StackActions.popToTop());
}

function dispatch(params: any) {
	navigationRef.current?.dispatch(params);
}

// Gets the current screen from navigation state
export const getActiveRoute: any = (state: any) => {
	const route = state?.routes[state?.index];

	if (route?.state) {
		// Dive into nested navigators
		return getActiveRoute(route.state);
	}

	return route;
};

export const getActiveRouteName = (state: any) => getActiveRoute(state)?.name;


export default {
	navigationRef,
	routeNameRef,
	navigate,
	back,
	replace,
	popToTop,
    getActiveRouteName,
	dispatch
};

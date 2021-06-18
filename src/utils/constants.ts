import { AbstractConnector } from '@web3-react/abstract-connector';
import { injected } from 'utils/connectors';

export const NetworkContextName = `${new Date().getTime()}-NETWORK`;
export const DEFAULT_NETWORK = 3;
// export const DAI_ADDRESS = '0x31f42841c2db5173425b5223809cf3a38fede360';
export const DAI_ADDRESS = '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea';

export interface WalletInfo {
	connector?: AbstractConnector;
	name: string;
	iconName: string;
	description: string;
	href?: string;
	color: string;
	primary?: boolean;
	mobile?: boolean;
	mobileOnly?: boolean;
	active?: boolean;
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
	INJECTED: {
		connector: injected,
		name: 'Injected',
		iconName: 'arrow-right.svg',
		description: 'Injected web3 provider.',
		href: undefined,
		color: '#010101',
		primary: true
	},
	METAMASK: {
		connector: injected,
		name: 'MetaMask',
		iconName: 'metamask.png',
		description: 'Easy-to-use browser extension.',
		href: undefined,
		color: '#E8831D'
	}
};

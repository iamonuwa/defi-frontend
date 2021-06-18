import React, { useCallback, useEffect, useState } from 'react';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { AbstractConnector } from '@web3-react/abstract-connector';
import {
	Typography,
	makeStyles,
	Theme,
	Box,
	Link,
	Dialog,
	DialogTitle,
	DialogContent,
	Button
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { SUPPORTED_WALLETS } from 'utils/constants';
import { isMobile } from 'react-device-detect';
import { WalletOptions } from 'components/Wallet/Option';
import { injected } from 'utils/connectors';
import { WalletPending } from 'components/Wallet/Pending';
import usePrevious from 'hooks/usePrevious';
import { useEagerConnect, useInactiveListener } from 'hooks/useWeb3';
import { shortenAddress } from 'utils';
import { useAppSelector } from 'hooks/useRedux';
import { selectExplorerLink } from 'store/reducers/app';

type WalletModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

const useStyles = makeStyles((theme: Theme) => ({
	dialogWrapper: {
		padding: theme.spacing(1),
		position: 'absolute',
		top: theme.spacing(5),
		width: 300
	},
	dialogTitle: {
		padding: theme.spacing(0)
	},
	dialogContent: {
		padding: theme.spacing(0)
	},
	flex: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center'
	}
}));

const WALLET_VIEWS = {
	OPTIONS: 'options',
	OPTIONS_SECONDARY: 'options_secondary',
	ACCOUNT: 'account',
	PENDING: 'pending'
};

export const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
	const { dialogTitle, dialogWrapper, dialogContent, flex } = useStyles();

	const { account, connector, activate, error, active } = useWeb3React();
	const [walletView, setWalletView] = useState<string>(WALLET_VIEWS.ACCOUNT);
	const [pendingWallet, setPendingWallet] = useState<
		AbstractConnector | undefined
	>();
	const [pendingError, setPendingError] = useState<boolean>();
	const [activatingConnector, setActivatingConnector] = useState<any>();
	const explorerLink = useAppSelector(selectExplorerLink);

	const previousAccount = usePrevious(account);

	useEffect(() => {
		if (activatingConnector && activatingConnector === connector) {
			setActivatingConnector(undefined);
		}
	}, [activatingConnector, connector]);

	useEffect(() => {
		if (account && !previousAccount && isOpen) {
			onClose();
		}
	}, [account, previousAccount, onClose, isOpen]);

	useEffect(() => {
		if (isOpen) {
			setPendingError(false);
			setWalletView(WALLET_VIEWS.ACCOUNT);
		}
	}, [isOpen]);

	const activePrevious = usePrevious(active);
	const connectorPrevious = usePrevious(connector);

	useEffect(() => {
		if (
			isOpen &&
			((active && !activePrevious) ||
				(connector && connector !== connectorPrevious && !error))
		) {
			setWalletView(WALLET_VIEWS.ACCOUNT);
		}
	}, [
		setWalletView,
		isOpen,
		active,
		error,
		connector,
		activePrevious,
		connectorPrevious
	]);

	const handleWalletChange = useCallback(() => {
		setWalletView(WALLET_VIEWS.OPTIONS);
	}, []);

	const tryActivation = async (connector: AbstractConnector | undefined) => {
		Object.keys(SUPPORTED_WALLETS).map(key => {
			if (connector === SUPPORTED_WALLETS[key].connector) {
				return SUPPORTED_WALLETS[key].name;
			}
			return true;
		});
		setPendingWallet(connector); // set wallet for pending view
		setWalletView(WALLET_VIEWS.PENDING);

		connector &&
			activate(connector, undefined, true).catch(error => {
				if (error instanceof UnsupportedChainIdError) {
					activate(connector); // a little janky...can't use setError because the connector isn't set
				} else {
					setPendingError(true);
				}
			});
	};

	function formatConnectorName() {
		// @ts-ignore
		const { ethereum } = window;
		const isMetaMask = !!(ethereum && ethereum.isMetaMask);
		const name: string = Object.keys(SUPPORTED_WALLETS)
			.filter(
				k =>
					SUPPORTED_WALLETS[k].connector === connector &&
					(connector !== injected || isMetaMask === (k === 'METAMASK'))
			)
			.map(k => SUPPORTED_WALLETS[k].name)[0];

		return (
			<Typography variant={'body1'}>
				Connected with {name.toString()}
			</Typography>
		);
	}

	const isTriedEager = useEagerConnect();
	useInactiveListener(!isTriedEager || !!activatingConnector);

	const getOptions = () => {
		let isMetamask: boolean = false;
		if (typeof window !== 'undefined') {
			// @ts-ignore
			isMetamask = window?.ethereum?.isMetaMask;
		}

		return Object.keys(SUPPORTED_WALLETS).map(key => {
			const option = SUPPORTED_WALLETS[key];

			if (isMobile) {
				// @ts-ignore
				if (!window?.web3 && !window?.ethereum && option.mobile) {
					return (
						<WalletOptions
							onClick={() => {
								option.connector !== connector &&
									!option.href &&
									tryActivation(option.connector);
							}}
							id={`connect-${key}`}
							key={key}
							color={option.color}
							link={option.href}
							header={option.name}
							subheader=""
							icon=""
						/>
					);
				}
				return null;
			}

			// overwrite injected when needed
			if (option.connector === injected) {
				// don't show injected if there's no injected provider
				// @ts-ignore
				if (!(window?.web3 || window?.ethereum)) {
					if (option.name === 'MetaMask') {
						return (
							<WalletOptions
								id={`connect-${key}`}
								key={key}
								color={'#E8831D'}
								header={'Install Metamask'}
								subheader=""
								link={'https://metamask.io/'}
								icon=""
							/>
						);
					} else {
						return null; //dont want to return install twice
					}
				}
				// don't return metamask if injected provider isn't metamask
				else if (option.name === 'MetaMask' && !isMetamask) {
					return null;
				}
				// likewise for generic
				else if (option.name === 'Injected' && isMetamask) {
					return null;
				}
			}

			// return rest of options
			return (
				!isMobile &&
				!option.mobileOnly && (
					<WalletOptions
						id={`connect-${key}`}
						onClick={() => {
							option.connector === connector
								? setWalletView(WALLET_VIEWS.ACCOUNT)
								: !option.href && tryActivation(option.connector);
						}}
						key={key}
						color={option.color}
						link={option.href}
						header={option.name}
						subheader="" //use option.description to bring back multi-line
						icon=""
					/>
				)
			);
		});
	};
	return (
		<Dialog open={isOpen} maxWidth="lg" classes={{ paper: dialogWrapper }}>
			{walletView === WALLET_VIEWS.ACCOUNT && account ? (
				<Box>
					<DialogTitle className={dialogTitle}>
						<Box className={flex}>
							<Typography variant="h5">{formatConnectorName()}</Typography>
							<CloseIcon onClick={onClose} />
						</Box>
					</DialogTitle>
					<DialogContent className={dialogContent}>
						<Box className={flex}>
							<Typography variant="h5">{shortenAddress(account)}</Typography>
							<Box>
								<Button size="small" onClick={handleWalletChange}>
									Change
								</Button>
								{/* <Button size="small" variant="contained" color="secondary">
									Disconnect
								</Button> */}
								{connector !== injected && (
									<Button
										size="small"
										variant="contained"
										color="primary"
										onClick={() => {
											(connector as any).close();
										}}
									>
										Disconnect
									</Button>
								)}
								{/* {connector !== walletconnect && (active || error) && (
									<Button
										size="small"
										 variant="contained" color="red"
										onClick={() => {
											deactivate();
										}}
									>
										Disconnect
									</Button>
								)} */}
							</Box>
						</Box>

						<Box>
							<Typography variant="body2">
								<Link
									href={`${explorerLink}/address/${account}`}
									target="_blank"
									rel="noreferrer noopener"
								>
									View on Etherscan
								</Link>
							</Typography>
						</Box>
					</DialogContent>
				</Box>
			) : error ? (
				<Box>
					<DialogTitle className={dialogTitle}>
						<Box className={flex}>
							<Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
								{error instanceof UnsupportedChainIdError
									? 'Wrong Network'
									: 'Error connecting'}
							</Typography>
							<CloseIcon onClick={onClose} />
						</Box>
					</DialogTitle>
					<DialogContent dividers className={dialogContent}>
						{error instanceof UnsupportedChainIdError ? (
							<Typography>
								{`App is running on ROPSTEN NETWORK. Please update your
                network configuration.`}
							</Typography>
						) : (
							'Error connecting. Try refreshing the page.'
						)}
					</DialogContent>
				</Box>
			) : (
				<Box>
					<DialogTitle className={dialogTitle}>
						<Box className={flex}>
							<Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
								Connect Wallet
							</Typography>
							<CloseIcon onClick={onClose} />
						</Box>
					</DialogTitle>
					<DialogContent className={dialogContent}>
						{walletView === WALLET_VIEWS.PENDING ? (
							<WalletPending
								connector={pendingWallet}
								error={pendingError}
								setPendingError={setPendingError}
								tryActivation={tryActivation}
							/>
						) : (
							<>{getOptions()} </>
						)}
						{walletView !== WALLET_VIEWS.PENDING && (
							<Typography variant="body2">
								New to Ethereum?{' '}
								<Link
									href="https://ethereum.org/wallets/"
									target="_blank"
									rel="noreferrer noopener"
								>
									Learn more about wallets
								</Link>
							</Typography>
						)}
					</DialogContent>
				</Box>
			)}
		</Dialog>
	);
};

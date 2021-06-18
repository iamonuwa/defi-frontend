import { Button, Typography, makeStyles, Theme } from '@material-ui/core';
import { Box } from '@material-ui/core';
import { AbstractConnector } from '@web3-react/abstract-connector';
import React, { FC } from 'react';

type WalletPendingProps = {
	connector?: AbstractConnector;
	error?: boolean;
	setPendingError: (error: boolean) => void;
	tryActivation: (connector: AbstractConnector) => void;
};

const useStyles = makeStyles((theme: Theme) => ({
	box: {
		margin: theme.spacing(2, 0)
	}
}));

export const WalletPending: FC<WalletPendingProps> = ({
	error,
	connector,
	setPendingError,
	tryActivation
}) => {
	const { box } = useStyles();
	return (
		<Box>
			{error ? (
				<Box className={box}>
					<Typography>Error connecting to Wallet</Typography>
					<Button
						onClick={() => {
							setPendingError(false);
							connector && tryActivation(connector);
						}}
					>
						Try again
					</Button>
				</Box>
			) : (
				<Box className={box}>
					<Typography>Connecting to a wallet</Typography>
				</Box>
			)}
		</Box>
	);
};

import React, { Fragment, useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { WalletModal } from 'components/Wallet';
import { useWeb3React } from '@web3-react/core';
import { shortenAddress } from 'utils';
import { Box } from '@material-ui/core';
import { useAppSelector } from 'hooks/useRedux';
import { selectETHBalance } from 'store/reducers/balances';
import { formatEther, parseEther } from 'ethers/lib/utils';

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		flexGrow: 1
	},
	title: {
		flexGrow: 1
	},
	account: {
		cursor: 'pointer'
	}
}));

const Header = () => {
	const classes = useStyles();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const { account } = useWeb3React();
	const ethBalance = useAppSelector(selectETHBalance);

	return (
		<Fragment>
			<div className={classes.root}>
				<AppBar position="static">
					<Toolbar>
						<Typography variant="h6" className={classes.title}>
							Defi Frontend
						</Typography>
						{account ? (
							<Box className={classes.account} onClick={() => setIsOpen(true)}>
								<Typography component="div">
									{shortenAddress(account)}
								</Typography>
								<Typography component="div">
									{formatEther(ethBalance.crypto)} ETH
								</Typography>
							</Box>
						) : (
							<Button variant="contained" onClick={() => setIsOpen(true)}>
								Connect Wallet
							</Button>
						)}
					</Toolbar>
				</AppBar>
			</div>
			<WalletModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</Fragment>
	);
};

export default Header;

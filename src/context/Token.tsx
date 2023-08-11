// @ts-nocheck
import React, { createContext, useContext, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { useToast } from '@chakra-ui/react';

import { useBlockchain } from './Blockchain';
import { useAccount } from './Account';

import abiDAI from 'src/utils/abi/DAI.json';
import abiNARS from 'src/utils/abi/NARS.json';
import bigNumberTokenToString from 'src/hooks/useUtils';

type TokenName = 'nars';
interface TokenContextInterface {
  tokens: {
    nars: BigNumber;
  };
  sendTransaction: (address: string, mount: number, token: TokenName) => null;
}

const TokenContext = createContext<TokenContextInterface | null>(null);

// Mainnet
// const addressDAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

// Test
// const addressDAI = '0x11fe4b6ae13d2a6055c8d9cf65c55bac32b5d844';
// const addressUSDC = '0xe27658a36ca8a59fe5cc76a14bde34a51e587ab4';
const addressNARS = '0x5e40f26E89213660514c51Fb61b2d357DBf63C85';

export function TokenWrapper({ children }) {
  // Chakra
  const toast = useToast();

  // Context
  const { laChainProvider } = useBlockchain();
  const { wallet, signer } = useAccount();

  // Component
  const [tokenNARS, setTokenNARS] = useState(ethers.constants.Zero);

  const providerNARS = new ethers.Contract(addressNARS, abiNARS, laChainProvider);

  // Obtener balance de Ethereum y DAI
  if (!!wallet?.address?.eth) {
    laChainProvider.on('block', () => {
      providerNARS.balanceOf(wallet?.address?.eth).then((balance) => {
        if (!balance?.eq(tokenNARS)) {
          setTokenNARS(balance);
        }
      });
    });
    // kovanProvider?.on('block', () => {
    //   if (tokenETH?.isZero() && tokenDAI?.isZero()) {
    //     kovanProvider.getBalance(wallet?.address?.eth).then((balance) => {
    //       if (!balance?.eq(tokenETH)) {
    //         setTokenETH(balance);
    //       }
    //     });

    //     providerDAI.balanceOf(wallet?.address?.eth).then((balance) => {
    //       if (!balance?.eq(tokenDAI)) {
    //         setTokenDAI(balance);
    //       }
    //     });
    //   }
    // });
  }

  // Enviar transaccion
  const sendTransaction = async (toAddress, mount, token) => {
    const addressIsValid = ethers.utils.isAddress(toAddress);
    if (addressIsValid) {
      // Send token nARS
      if (token === 'nars') {
        const narsSigner = providerNARS.connect(signer);
        const nars = ethers.utils.parseUnits(String(mount), 18);

        try {
          await narsSigner.transfer(toAddress, nars);

          return {
            success: true,
          };
        } catch (error) {
          return {
            success: false,
            error,
          };
        }
      }
      // if (token === 'dai') {
      //   const daiWithSigner = providerDAI.connect(signer);
      //   const dai = ethers.utils.parseUnits(String(mount), 18);

      //   try {
      //     await daiWithSigner.transfer(toAddress, dai);
      //     return {
      //       success: true,
      //     };
      //   } catch (error) {
      //     return {
      //       success: false,
      //       error,
      //     };
      //   }
      // } else {
      //   // Send token ETH
      //   const tx = {
      //     to: toAddress,
      //     value: ethers.utils.parseUnits(String(mount.toFixed(18))),
      //   };

      //   try {
      //     await signer.signTransaction(tx);
      //     const { hash } = await signer.sendTransaction(tx);
      //     console.log('hash', hash);

      //     return {
      //       success: true,
      //       error: null,
      //     };
      //   } catch (error) {
      //     return {
      //       success: false,
      //       error,
      //     };
      //   }
      // }
    } else {
      toast({
        description: 'La address parece ser incorrecta.',
        status: 'warning',
      });

      return {
        success: false,
        error: null,
      };
    }
  };

  return (
    <TokenContext.Provider value={{ tokens: { nars: tokenNARS }, sendTransaction }}>{children}</TokenContext.Provider>
  );
}

export function useToken() {
  return useContext(TokenContext);
}

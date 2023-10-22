# ZKSafePaymaster - Decentralized Paymasters for Safe Multisigs

## Welcome to the ZKSafePaymaster project ⚛☢🦾! 

![ZKSafePaymaster Logo](https://bafkreicy56ymwhmxfkct2hbwnmtqwsjhs2d62u7nmlxe7otv3cdnfc6d24.ipfs.nftstorage.link/)

## Project Description 🌌

ZKSafePaymaster is a groundbreaking project designed to empower Safe Multisigs by transforming them into decentralized paymasters. Paymasters serve a crucial role in managing user transaction fees, simplifying the process, and enhancing overall efficiency. However, traditional paymasters suffer from centralization issues, especially when it comes to deciding which contracts can execute transactions and which addresses can perform relays. This centralized control undermines the very principles of decentralization that blockchain technology stands for.

### The Problem ⚠️

Conventional paymasters are centralized, exerting control over the execution of contracts and relaying methods. This centralization not only hinders the fundamental principles of blockchain but also poses security and trust issues. The lack of transparency and inclusivity in the decision-making process for paymasters has been a long-standing problem in the blockchain community.

### The Solution 👨🏽‍💻

ZKSafePaymaster offers an elegant solution to this problem by allowing Safe owners to take control and decentralize the paymaster function. Safe owners can now specify the contracts and methods that their Safe can relay, and this information is securely recorded in the Safe-ZKSafePaymaster-Plugin contract. Additionally, the Plugin requires Safe owners to set up ZKProofs - "CLAIMS," which provide a mechanism for individuals to prove their legitimacy to the contract using SISMO.

These proofs can also be used to set restrictions on who has access to generate valid proofs and subsequently get their transactions relayed. The result is a far more decentralized and secure paymaster solution, aligning with the core values of blockchain technology.

## Core Technologies Used 👑

- Safe Multisigs
- SISMO (Zero-Knowledge Proofs) to restrict relaying access
    - SismoConnect SDK
    - SismoConnect Compatible contract
        - ZKSafePaymaster contract is able to verify every ZKProof in the Sismo Ecosystem
- Gelato SDK v5 
- Gelato Contracts v3 ***callWithSyncFee***

## Advantages ☝

- **Decentralization:** ZKSafePaymaster turns traditional paymasters into decentralized entities, giving more power and control to Safe owners and users.

- **Security:** The integration of ZKProofs and SISMO ensures that only authorized individuals or entities can generate valid proofs and access transaction relaying.

- **Transparency:** With the ability for Safe owners to specify contract interactions and methods, the decision-making process becomes transparent and more inclusive.

- **Efficiency:** The use of Gelato SDK with ERC2771 enhances the reliability and robustness of the paymaster function, making transactions faster and more efficient.

## Next Steps ⏩

Our next goal is to create an SDK that allows any project to easily implement a button for their users to relay transactions. By making use of the ERC2771 and GelatoFreeSyncWithERC2771, this plugin becomes fully interoperable and robust to this solution.

## How it's Made 🛠️

ZKSafePaymaster is crafted through a synergy of cutting-edge technologies and meticulous design:

- **Safe Multisigs:** We start with Safe Multisigs, a foundational component of decentralized finance, known for their robust security features.

- **Decentralization:** Through our innovative plugin, we empower Safe owners, granting them the authority to specify which contracts and methods their Safe can relay.

- **ZKProofs:** We integrate Zero-Knowledge Proofs (ZKProofs) into the solution, enabling users to validate their identity and rights, enhancing security and trust.

- **SISMO Integration:** Self-Sovereign Identity Management on the Blockchain (SISMO) is implemented to provide a secure mechanism for verifying identities and controlling access.

- **Gelato SDK:** The latest Gelato SDK, coupled with ERC2771, ensures efficiency and reliability in transaction execution and relaying.

The result is a decentralized paymaster solution that promotes transparency, security, and inclusivity, revolutionizing the way blockchain transactions are handled. It's a harmonious blend of technology and innovation, setting a new standard for the blockchain industry.

Join us to reshape the future of blockchain transactions with ZKSafePaymaster!

# Safe{Core} ZKSafePaymaster

This repository contain an implementation using Safe [Plugins](https://github.com/5afe/safe-core-protocol-specs/tree/main/integrations#plugins) from the Safe{Core} Protocol. 

## Structure 🧬

The repository is separated into three parts:

- [Contracts](./contracts/) contains the sample contracts and scripts to deploy them
- [Web App](./web/) contains the web app to configure you ZKSafePaymaster plugin
- [Client](./client/) contains the application to relay transactions


## Contributing

We welcome contributions from the community. If you'd like to contribute to ZKSafePaymaster, please read our [Contribution Guidelines](./CONTRIBUTING.md).

## License 🧾

This project is licensed under the [MIT License](./LICENSE).

---

Thank you for considering ZKSafePaymaster as your decentralized paymaster solution.

Let's revolutionize blockchain transactions together! 🚀


Enjoy using ZKSafePaymaster!



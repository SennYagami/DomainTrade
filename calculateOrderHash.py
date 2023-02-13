
from web3 import Web3

orderComponents = {
    "offerer": "0x8705f166792eeD5Be37b6573752C19F574CF05ac",
    "zone": "0x0000000000000000000000000000000000000000",
    "offer": [
        {
            "itemType": 2,
            "token": "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
            "identifierOrCriteria": {
                "type": "BigNumber",
                "hex": "0x9a4eb8e9ee86549ac49044b4463d38fd060250d9bcdaf094a91fc3809a60fbec"
            },
            "startAmount": {
                "type": "BigNumber",
                "hex": "0x01"
            },
            "endAmount": {
                "type": "BigNumber",
                "hex": "0x01"
            }
        }
    ],
    "consideration": [
        {
            "itemType": 0,
            "token": "0x0000000000000000000000000000000000000000",
            "identifierOrCriteria": {
                "type": "BigNumber",
                "hex": "0x00"
            },
            "startAmount": {
                "type": "BigNumber",
                "hex": "0x2386f26fc10000"
            },
            "endAmount": {
                "type": "BigNumber",
                "hex": "0x2386f26fc10000"
            },
            "recipient": "0x8705f166792eeD5Be37b6573752C19F574CF05ac"
        }
    ],
    "totalOriginalConsiderationItems": 1,
    "orderType": 0,
    "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "salt": "0xbcbb45b3401ac80ee9ede1c74469319928ac71111b7159821cd61dd3cc78862d",
    "conduitKey": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "startTime": 1670980560,
    "endTime": 1670990560,
    "counter": {
        "type": "BigNumber",
        "hex": "0x05"
    }
}
    

def orderHashGetter(orderParameters, counter):
    offerItemTypeHash = "0xa66999307ad1bb4fde44d13a5d710bd7718e0c87c1eef68a571629fbf5b93d02"
    considerationItemTypeHash = "0x42d81c6929ffdc4eb27a0808e40e82516ad42296c166065de7f812492304ff6e"
    orderTypeHash = "0xfa445660b7e21515a59617fcd68910b487aa5808b8abda3d78bc85df364b2c2f"

    offerHash = Web3.keccak(
        hexstr="0x"
        + "".join(
            [
                Web3.keccak(
                    hexstr="0x"
                    + "".join(
                        [
                            offerItemTypeHash[2:],
                            str(offerItem["itemType"]).zfill(64),
                            offerItem["token"][2:].zfill(64),
                            offerItem["identifierOrCriteria"]["hex"][2:].zfill(64),
                            offerItem["startAmount"]["hex"][2:].zfill(64),
                            offerItem["endAmount"]["hex"][2:].zfill(64),
                        ]
                    )
                ).hex()[2:]
                for offerItem in orderParameters["offer"]
            ]
        )
    ).hex()

    considerationHash = Web3.keccak(
        hexstr="0x"
        + "".join(
            [
                Web3.keccak(
                    hexstr="0x"
                    + "".join(
                        [
                            considerationItemTypeHash[2:],
                            str(considerationItem["itemType"]).zfill(64),
                            considerationItem["token"][2:].zfill(64),
                            considerationItem["identifierOrCriteria"]["hex"][2:].zfill(64),
                            considerationItem["startAmount"]["hex"][2:].zfill(64),
                            considerationItem["endAmount"]["hex"][2:].zfill(64),
                            considerationItem["recipient"][2:].zfill(64),
                        ]
                    )
                ).hex()[2:]
                for considerationItem in orderParameters["consideration"]
            ]
        )
    ).hex()

    derivedOrderHash = Web3.keccak(
        hexstr="0x"
        + "".join(
            [
                orderTypeHash[2:],
                orderParameters["offerer"][2:].zfill(64),
                orderParameters["zone"][2:].zfill(64),
                offerHash[2:],
                considerationHash[2:],
                str(orderParameters["orderType"]).zfill(64),
                hex(orderParameters["startTime"])[2:].zfill(64),
                hex(orderParameters["endTime"])[2:].zfill(64),
                orderParameters["zoneHash"][2:].zfill(64),
                orderParameters["salt"][2:].zfill(64),
                orderParameters["conduitKey"][2:].zfill(64),
                hex(counter)[2:].zfill(64),
            ]
        )
    ).hex()

    return derivedOrderHash


orderHashGetter()
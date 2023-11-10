
wss://nostr-pub.wellorder.net/

//allows me to subscribe to events that I am mentioned in. 
[
    "REQ",
    "27afdcb6-404d-4546-b9da-edcb8b9af560",
    {
        "kinds": [
            1
        ],
        "tags":   [  ["p", "1ee6d310d3735f3d36598dfd423bf34706d764b3010ec1807d84542a87c90e4a"] ]
    }
]


returns my relays in the content property
wss://cache2.primal.net/v1
[
	"REQ",
	"some-uuid",
	{
		"cache": [
			"contact_list",
			{
				"pubkey": "1ee6d310d3735f3d36598dfd423bf34706d764b3010ec1807d84542a87c90e4a",
				"extended_response": false
			}
		]
	}
]
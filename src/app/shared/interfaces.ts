export interface IGame {
    _id: string,
    highlights?: string,
    votes: any[],
    awayTeam: {
        _id: string,
        teamName: string,
        abbreviation: string,
        wins: number,
        loses: number,
        league: string,
        logo: string,
        background: string
        
    }
	homeTeam: {
        _id: string,
        teamName: string,
        abbreviation: string,
        wins: number,
        loses: number,
        league: string,
        logo: string  ,
        background: string  
    },
    awayTeamScore?: number,
    replies: number,
    views: number,
    awayRuns: number,
    awayTeamPoints1?: number,
    awayTeamR: number,
    awayTeamH: number,
    awayTeamE: number,
    awayTeamPoints2?: number,
    awayTeamPoints3?: number,
    awayTeamPoints4?: number,
    awayTeamPointsOT?: number,
    awayTeamPointsSO?: number,
    homeTeamPoints1?: number,
    homeTeamPoints2?: number,
    homeTeamPoints3?: number,
    homeTeamPoints4?: number,
    homeTeamPointsSO?: number,
    homeTeamPointsOT?: number,
    homeTeamR: number,
    homeTeamH: number,
    homeTeamE: number,
    homeRuns: number,
    homeTeamScore?: number,
    gameDate: Date,
    gameTime: string,
    league: string,
    seasonYear: number,
    seasonType: string,

     //Soccer
     homeTeamGoals:
     [{
         player: string,
         minute: number
     }],
    awayTeamGoals:
     [{
         player: string,
         minute: number
     }],
    homeTeamScorePenalties: number,
    awayTeamScorePenalties: number

}

export interface ITeam {
    _id: string,
    teamName: string,
    abbreviation: string,
    wins: number,
    loses: number,
    background: string,
    league: string,
    selected: boolean,
    selectedFav: boolean,
    logo: string,
    stadium: string

}

export interface IChat {
    _id: string,
    roomNotifications: boolean,
    unread: boolean,
    members: any[],
    clicked: boolean,
    team: any,
    public: boolean;
    game: any,
    room: boolean,
    usernameTyping: string,
    league: string,
    connecting: any, 
    online: boolean,
    muted: boolean,
    unreadMessages: any,
    recipient: any,
    otherUserPictureThumb: string,
    channelType: string,
    url: string,  
    unreadMessageCount: number,
    customType: string,
    chatName: string,
    lastSeenAt: string,
    otherUserPicture: string,
    refresh: () => {},
    createPreviousMessageListQuery: any,
    sendUserMessage: any,
    metadata: any,
    typing: string,
    coverUrl: string,
    createdAt: number,
    data: any, 
    name: string,
    lastMessage: any,
    lastMessageTime: string,
    userColors: any,
    modified: Date,
    read: boolean,
    messages: any[]

}

export interface ILink {
    _id: string,
    title: string,
    league: string,
    link: number,
    image: number,
    source: string,
    featured: boolean,
    

}

export interface IUser {

    fullName: string,
    username: string,
    rooms: any[],
    dailyTrivias: any[],
    dmsOpen: boolean,
    verified: boolean,
    bio: string,
    playerIds: string[],
    favAllTeams: any[],
    favMainTeams: any[],
    email: string,
    password: string,
    confirmPassword: string,
    profilePictureName: string,
    profilePictureNameThumbnail: string,
    createdAt: Date,
    coverPhoto: string,
    coverPhotoName: string,
    totalPoints: number,
    badge: any,
    leagues: string[]
}


export interface IUserDB {
    
    fullName: string,
    rooms: any[],
    dailyTrivias: any[],
    provFollowing: any,
    loadingFollow: any,
    favAllTeams: any[],
    favMainTeams: any[],
    dmsOpen: boolean,
    metaData: any,
    bio: string,
    username: string,
    verified: boolean,
    versionNumber: string,
    email: string,
    usersBlocked: string[],
    profilePicture: string,
    profilePictureThumbnail: string,
    leagues: string[],
    isAdmin?: boolean,
    notifications: any[],
    profilePictureName: string,
    profilePictureNameThumbnail: string,
    createdAt: Date,
    coverPhoto: string,
    playerIds: string[],
    following: string[],
    followersNumber: number,
    followingNumber: number,
    coverPhotoName: string,
    notis: [{
        user: string,
		text: string,
		notification: string,
		thread:  string,
		game:  string,
		typeOf: string
    }],
    _id: string,
    badge: any,
    totalPoints: number
    
}

export interface ITimeline {
    _id: string,
    user: { 
        fullName: string,
        username: string,
        verified: boolean,
        profilePicture: string,
        profilePictureThumbnail: string,
        _id: string,
        badge: any,
        playerIds: string[]
        
    },
    thread: any,
    take: any,
    likedByUser: boolean,
    created: string,
    answers: any[],
    date: Date,
    count: number,
    discussion: string,
    likers: string[],
    dislikers: string[],
    numberOfAnswers: number,
    userPost: boolean,
    numberOfLikers?: number,
    numberOfdisLikers?: number,
    post: boolean,
    game: {

        _id:string
    }
    
}

export interface IUserDiscussion {
    _id: string,
    discussion: string,
    favAllTeams: any[],
    favMainTeams: any[],
    bio: string,
    date: Date,
    game: {
        _id: string,
        awayTeam: {
            _id: string,
            abbreviation: string

        }
        homeTeam: {
            _id: string,
            abbreviation: string
        }

    },
    thread?: {
        title: string,
        _id: string

    },
    numberOfLikers: number,
    numberOfDislikers: number,
    numberOfAnswers: number,
    
    
}

export interface IUserAnswer {
    
    _id: string,
    thread?: {
        title: string,
        _id: string

    },
    answers: {
        date: Date,
        responding: {
            _id: string,
            username: string,
            verified: boolean,
        },
        replyText: string,
        discussion: string,
        _id: string
    },
    game: {
        _id: string,
        awayTeam: {
            _id: string,
            abbreviation: string

        }
        homeTeam: {
            _id: string,
            abbreviation: string
        }

    },
    
    
    numberOfLikers: number,
    numberOfDislikers: number,
        
}

export interface IMention {
    
    
    date: Date,
         _id: string,
         game: {
             awayTeam: {
                 _id: string,
                 abbreviation: string
    
             }
             homeTeam: {
                 _id: string,
                 abbreviation: string
             },
             
             _id: string
    
         },
         answers: {
             date: Date,
             _id: string,
             discussion: string,
             responding: {
                 _id: string,
                 username: string,
                 verified: boolean,
             },
             user: { 
                 fullName: string,
                 username: string,
                 verified: boolean,
                 profilePicture: string,
                 profilePictureThumbnail: string,
                 badge: any

             },
             replyText: string,
             likers: string[],
             dislikers:string[]
         },

    
        
}



export interface IAnswer {
    _id: string,
    user: { 
        fullName: string,
        username: string,
        verified: boolean,
        profilePicture: string,
        profilePictureThumbnail: string,
        playerIds: string[],
        _id: string,
        badge: any
    },
    parent: string,
    replyTextToShow: string,
    replyType: string,
    children?: any[],
    created: any,
    inReplyTo: string,
    likedByUser: boolean,
    count: number,
    replyText: string,
    date: Date,
    discussion: string,
    likers: string[],
    dislikers: string[],
    responding: {
        username: string
        verified: boolean,

    } 
    
}

export interface IPoll {
    _id: string,
    title: string,
    date: Date,
    league: string,
    pollValues: string[],
    votes: any[],
    featured: boolean
    
    
}


          

export interface IBadge {
    _id: string,
    picture: string,
    level: number,
    name: string,
    nextPoints: number,
    nextName: any[],
    previousPoints: number
    
    
    
}

export interface ITrivia {
    _id: string,
    correct: boolean,
    timesUp: boolean,
    revealAnswer: boolean,
    pending: boolean,
    options: any[],
    league: string,
    correctOption: string,
    question: string,
    user: { 
        fullName: string,
        username: string,
        verified: boolean,
        profilePicture: string,
        profilePictureThumbnail: string,
        _id: string,
        badge: any,
        playerIds: string[]
    },
   
    
    
}

export interface ITake {
    _id: string,
    badge: any,
    take: string,
    teams: any[],
    bookmarks: string[],
    optionsWithPercentage: any[],
    voted: boolean,
    fromWeb: boolean,
    likedByUser: boolean,
    created: any,
    featured: boolean,
    count: number,
    videoCurrentTime: any,
    videoElement: any,
    videoDuration: any,
    videoHeight: number,
    videoWidth: number,
    pictureHeight: number,
    pictureWidth: number,
    reducedTitle: string,
    canvas: any,
    picture: string,
    thumbnail: string,
    video: string,
    videoThumbnail: string,
    user: { 
        fullName: string,
        username: string,
        verified: boolean,
        profilePicture: string,
        profilePictureThumbnail: string,
        _id: string,
        badge: any,
        playerIds: string[]
    },
    title: string,
    imageCached: boolean,
    description?: string,
    type?: string,
    htmlWidth: number,
    htmlHeight: number,
    pollValues?: string[],
    likers: string[],
    abValues?: string[],
    votes?: [{
        user: string,
        option: string
    }],
    league: string,
    replies: number,
    views: number,
    date: Date,
    url?: string,
    source?: string,
    urlType: string,
    provider_name: string
    provider_url: string, //short: i.e youtube.com
    html: string,
    thumbnail_url: string,
    urlTitle: string,
    urlDescription: string,
    thumbnail_width: number,
    thumbnail_height: number,
    favicon_url: string,
    
    
}

export interface IThread {
    _id: string,
    badge: any,
    teams: any[],
    fromWeb: boolean,
    likedByUser: boolean,
    bookmarks: string[],
    savedByUser: boolean,
    created: any,
    featured: boolean,
    count: number,
    picture: string,
    thumbnail: string,
    video: string,
    videoThumbnail: string,
    user: { 
        fullName: string,
        username: string,
        verified: boolean,
        profilePicture: string,
        profilePictureThumbnail: string,
        _id: string,
        badge: any,
        playerIds: string[]
    },
    title: string,
    imageCached: boolean,
    description?: string,
    type?: string,
    pollValues?: string[],
    likers: string[],
    abValues?: string[],
    votes?: [{
        user: string,
        option: string
    }],
    league: string,
    replies: number,
    views: number,
    date: Date,
    url?: string,
    source?: string,
    BroadcastChannel
    
    
}
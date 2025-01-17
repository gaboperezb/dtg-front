import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { ChatGuard } from '../core/chat.guard';

const routes: Routes = [
	{
		path: 'tabs',
		component: TabsPage,
		children: [
			{
				path: 'tab1',
				children: [
					{
						path: '',
						loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule)
					},
					
					{ path: 'thread-detail/:id', loadChildren: () => import('../thread-detail/thread-detail.module').then(m => m.ThreadDetailPageModule) },
					{ path: 'trivia-detail/:id', loadChildren: () => import('../trivia-detail/trivia-detail.module').then(m => m.TriviaDetailPageModule) },
					{ path: 'fav-detail/:id', loadChildren: () => import('../fav-detail/fav-detail.module').then(m => m.FavDetailPageModule) },
					{ path: 'user/:id', loadChildren: () => import('../user/user.module').then(m => m.UserPageModule) },
					{ path: 'profile', loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule) },
					{ path: 'followers/:id', loadChildren: () => import('../followers/followers.module').then(m => m.FollowersPageModule) },
					{ path: 'timeline-detail/:id', loadChildren: () => import('../timeline-detail/timeline-detail.module').then(m => m.TimelineDetailPageModule) },
					{ path: 'take-timeline-detail/:id', loadChildren: () => import('../take-timeline-detail/take-timeline-detail.module').then(m => m.TakeTimelineDetailPageModule) },
					{
						path: 'trivia-timeline-detail/:id',
						loadChildren: () => import('../trivia-timeline-detail/trivia-timeline-detail.module').then( m => m.TriviaTimelineDetailPageModule)
					  },

					{ path: 'edit', loadChildren: () => import('../edit/edit.module').then(m => m.EditPageModule) },
					
					{ path: 'teams', loadChildren: () => import('../teams/teams.module').then(m => m.TeamsPageModule) },
					{ path: 'edit-form', loadChildren: () => import('../edit-form/edit-form.module').then(m => m.EditFormPageModule) },
					{ path: 'edit-thread', loadChildren: () => import('../edit-thread/edit-thread.module').then(m => m.EditThreadPageModule) },
					{ path: 'edit-take', loadChildren: () => import('../edit-take/edit-take.module').then(m => m.EditTakePageModule) },
					{ path: 'all-featured/:league', loadChildren: () => import('../all-featured/all-featured.module').then(m => m.AllFeaturedPageModule) },
					{ path: 'chats', loadChildren: () => import('../chats/chats.module').then(m => m.ChatsPageModule), canActivate: [ChatGuard] },
					{ path: 'chat-detail/:id', loadChildren: () => import('../chat-detail/chat-detail.module').then(m => m.ChatDetailPageModule) },
					{ path: 'chat-info/:id', loadChildren: () => import('../chat-info/chat-info.module').then(m => m.ChatInfoPageModule) },
					{
						path: 'search',
						loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule)
					},
					{
						path: 'take-detail/:id',
						loadChildren: () => import('../take-detail/take-detail.module').then(m => m.TakeDetailPageModule)
					}
				]
			},
			{
				path: 'tab2',
				children: [
					{ path: '', loadChildren: () => import('../chats/chats.module').then(m => m.ChatsPageModule), canActivate: [ChatGuard] },
					{ path: 'thread-detail/:id', loadChildren: () => import('../thread-detail/thread-detail.module').then(m => m.ThreadDetailPageModule) },
					{ path: 'fav-detail/:id', loadChildren: () => import('../fav-detail/fav-detail.module').then(m => m.FavDetailPageModule) },
					{ path: 'trivia-detail/:id', loadChildren: () => import('../trivia-detail/trivia-detail.module').then(m => m.TriviaDetailPageModule) },
					{ path: 'user/:id', loadChildren: () => import('../user/user.module').then(m => m.UserPageModule) },
					{ path: 'profile', loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule) },
					{
						path: 'trivia-timeline-detail/:id',
						loadChildren: () => import('../trivia-timeline-detail/trivia-timeline-detail.module').then( m => m.TriviaTimelineDetailPageModule)
					  },
					{ path: 'followers/:id', loadChildren: () => import('../followers/followers.module').then(m => m.FollowersPageModule) },
					{ path: 'timeline-detail/:id', loadChildren: () => import('../timeline-detail/timeline-detail.module').then(m => m.TimelineDetailPageModule) },
					{ path: 'new-thread', loadChildren: () => import('../new-thread/new-thread.module').then(m => m.NewThreadPageModule) },
					{ path: 'edit', loadChildren: () => import('../edit/edit.module').then(m => m.EditPageModule) },
					{ path: 'take-timeline-detail/:id', loadChildren: () => import('../take-timeline-detail/take-timeline-detail.module').then(m => m.TakeTimelineDetailPageModule) },
					
					{ path: 'teams', loadChildren: () => import('../teams/teams.module').then(m => m.TeamsPageModule) },
					{ path: 'edit-form', loadChildren: () => import('../edit-form/edit-form.module').then(m => m.EditFormPageModule) },
					{ path: 'edit-thread', loadChildren: () => import('../edit-thread/edit-thread.module').then(m => m.EditThreadPageModule) },
					{ path: 'edit-take', loadChildren: () => import('../edit-take/edit-take.module').then(m => m.EditTakePageModule) },
					
					{ path: 'all-featured/:league', loadChildren: () => import('../all-featured/all-featured.module').then(m => m.AllFeaturedPageModule) },
					{ path: 'chat-detail/:id', loadChildren: () => import('../chat-detail/chat-detail.module').then(m => m.ChatDetailPageModule) },
					{ path: 'chat-info/:id', loadChildren: () => import('../chat-info/chat-info.module').then(m => m.ChatInfoPageModule) },
					{
						path: 'take-detail/:id',
						loadChildren: () => import('../take-detail/take-detail.module').then(m => m.TakeDetailPageModule)
					}
				]
			},
			{
				path: 'tab3',
				children: [
					
					{ path: '', loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule) },
					{ path: 'new-take', loadChildren: () => import('../new-take/new-take.module').then(m => m.NewTakePageModule) },
					{ path: 'new-thread', loadChildren: () => import('../new-thread/new-thread.module').then(m => m.NewThreadPageModule) },
					{ path: 'trivia-detail/:id', loadChildren: () => import('../trivia-detail/trivia-detail.module').then(m => m.TriviaDetailPageModule) },
					{
						path: 'trivia-timeline-detail/:id',
						loadChildren: () => import('../trivia-timeline-detail/trivia-timeline-detail.module').then( m => m.TriviaTimelineDetailPageModule)
					  },
					{ path: 'chats', loadChildren: () => import('../chats/chats.module').then(m => m.ChatsPageModule), canActivate: [ChatGuard] },
					{ path: 'edit-take', loadChildren: () => import('../edit-take/edit-take.module').then(m => m.EditTakePageModule) },
					{ path: 'chat-detail/:id', loadChildren: () => import('../chat-detail/chat-detail.module').then(m => m.ChatDetailPageModule) },
					{ path: 'chat-info/:id', loadChildren: () => import('../chat-info/chat-info.module').then(m => m.ChatInfoPageModule) }

				]
			},
			{
				path: 'tab4',
				children: [
					{
						path: '',
						loadChildren: () => import('../tab4/tab4.module').then(m => m.Tab4PageModule)
					},
					
					{ path: 'thread-detail/:id', loadChildren: () => import('../thread-detail/thread-detail.module').then(m => m.ThreadDetailPageModule) },
					{ path: 'fav-detail/:id', loadChildren: () => import('../fav-detail/fav-detail.module').then(m => m.FavDetailPageModule) },
					{ path: 'user/:id', loadChildren: () => import('../user/user.module').then(m => m.UserPageModule) },
					{ path: 'trivia-detail/:id', loadChildren: () => import('../trivia-detail/trivia-detail.module').then(m => m.TriviaDetailPageModule) },
					{ path: 'profile', loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule) },
					{ path: 'followers/:id', loadChildren: () => import('../followers/followers.module').then(m => m.FollowersPageModule) },
					{
						path: 'trivia-timeline-detail/:id',
						loadChildren: () => import('../trivia-timeline-detail/trivia-timeline-detail.module').then( m => m.TriviaTimelineDetailPageModule)
					  },
					{ path: 'take-timeline-detail/:id', loadChildren: () => import('../take-timeline-detail/take-timeline-detail.module').then(m => m.TakeTimelineDetailPageModule) },
					{ path: 'edit-take', loadChildren: () => import('../edit-take/edit-take.module').then(m => m.EditTakePageModule) },
					{ path: 'timeline-detail/:id', loadChildren: () => import('../timeline-detail/timeline-detail.module').then(m => m.TimelineDetailPageModule) },
					
					{ path: 'edit', loadChildren: () => import('../edit/edit.module').then(m => m.EditPageModule) },


					{ path: 'edit-form', loadChildren: () => import('../edit-form/edit-form.module').then(m => m.EditFormPageModule) },
					{ path: 'edit-thread', loadChildren: () => import('../edit-thread/edit-thread.module').then(m => m.EditThreadPageModule) },
					{ path: 'all-featured/:league', loadChildren: () => import('../all-featured/all-featured.module').then(m => m.AllFeaturedPageModule) },
					{ path: 'chats', loadChildren: () => import('../chats/chats.module').then(m => m.ChatsPageModule), canActivate: [ChatGuard] },
					{ path: 'trivia-detail/:id', loadChildren: () => import('../trivia-detail/trivia-detail.module').then(m => m.TriviaDetailPageModule) },
					{ path: 'chat-detail/:id', loadChildren: () => import('../chat-detail/chat-detail.module').then(m => m.ChatDetailPageModule) },
					{ path: 'edit-take', loadChildren: () => import('../edit-take/edit-take.module').then(m => m.EditTakePageModule) },
					{ path: 'chat-info/:id', loadChildren: () => import('../chat-info/chat-info.module').then(m => m.ChatInfoPageModule) },

					{ path: 'take-timeline-detail/:id', loadChildren: () => import('../take-timeline-detail/take-timeline-detail.module').then(m => m.TakeTimelineDetailPageModule) },

					{
						path: 'take-detail/:id',
						loadChildren: () => import('../take-detail/take-detail.module').then(m => m.TakeDetailPageModule)
					}

				]
			},
			{
				path: 'tab5',
				children: [
					{
						path: '',
						loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
					},
					{ path: 'thread-detail/:id', loadChildren: () => import('../thread-detail/thread-detail.module').then(m => m.ThreadDetailPageModule) },
					{ path: 'fav-detail/:id', loadChildren: () => import('../fav-detail/fav-detail.module').then(m => m.FavDetailPageModule) },
					{ path: 'user/:id', loadChildren: () => import('../user/user.module').then(m => m.UserPageModule) },
					{ path: 'profile', loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule) },
					{ path: 'followers/:id', loadChildren: () => import('../followers/followers.module').then(m => m.FollowersPageModule) },
					{
						path: 'trivia-timeline-detail/:id',
						loadChildren: () => import('../trivia-timeline-detail/trivia-timeline-detail.module').then( m => m.TriviaTimelineDetailPageModule)
					  },
					{ path: 'trivia-detail/:id', loadChildren: () => import('../trivia-detail/trivia-detail.module').then(m => m.TriviaDetailPageModule) },
					{ path: 'timeline-detail/:id', loadChildren: () => import('../timeline-detail/timeline-detail.module').then(m => m.TimelineDetailPageModule) },

					{ path: 'edit', loadChildren: () => import('../edit/edit.module').then(m => m.EditPageModule) },
					{ path: 'take-timeline-detail/:id', loadChildren: () => import('../take-timeline-detail/take-timeline-detail.module').then(m => m.TakeTimelineDetailPageModule) },

					{ path: 'edit-form', loadChildren: () => import('../edit-form/edit-form.module').then(m => m.EditFormPageModule) },
					{ path: 'edit-thread', loadChildren: () => import('../edit-thread/edit-thread.module').then(m => m.EditThreadPageModule) },
					{ path: 'edit-take', loadChildren: () => import('../edit-take/edit-take.module').then(m => m.EditTakePageModule) },
					{ path: 'all-featured/:league', loadChildren: () => import('../all-featured/all-featured.module').then(m => m.AllFeaturedPageModule) },
					{ path: 'chats', loadChildren: () => import('../chats/chats.module').then(m => m.ChatsPageModule), canActivate: [ChatGuard] },
					{ path: 'chat-detail/:id', loadChildren: () => import('../chat-detail/chat-detail.module').then(m => m.ChatDetailPageModule) },
					{ path: 'chat-info/:id', loadChildren: () => import('../chat-info/chat-info.module').then(m => m.ChatInfoPageModule) },
					{ path: 'teams', loadChildren: () => import('../teams/teams.module').then(m => m.TeamsPageModule) },

					{
						path: 'take-detail/:id',
						loadChildren: () => import('../take-detail/take-detail.module').then(m => m.TakeDetailPageModule)
					}


				]
			},
			{
				path: '',
				redirectTo: '/tabs/tab1',
				pathMatch: 'full'
			}
		]
	},
	{
		path: '',
		redirectTo: '/tabs/tab1',
		pathMatch: 'full'
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes)
	],
	exports: [RouterModule]
})
export class TabsPageRoutingModule { }

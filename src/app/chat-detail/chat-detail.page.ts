import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { NavController, IonContent, ToastController, LoadingController } from '@ionic/angular';
import { IChat } from '../shared/interfaces';
import { ChatService } from '../core/chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { WebSocketService } from '../core/websocket.service';
import * as _ from 'lodash';
import { AppState } from '../core/state.service';


@Component({
	selector: 'app-chat-detail',
	templateUrl: './chat-detail.page.html',
	styleUrls: ['./chat-detail.page.scss'],
})
export class ChatDetailPage implements OnInit {

	@ViewChild('chatTab', { static: true }) content: IonContent;
	@ViewChild('list', { static: true }) chatList: ElementRef;
	@ViewChild('sendButton', { static: true }) sendButton: ElementRef;
	chat: IChat;
	id: string;
	message: string = "";
	messages: any[] = [];
	skip: number = 0;
	userColors: any;
	hideTopSpinner: boolean = false;
	otherUser: any;
	chatName: string;
	unread: boolean;
	file: File;
	fileThumbnail: File;
	fileName: string;
	fileType: string;
	isImage: boolean = false;
	scrollPosition: number;
	scrollToUndread: boolean = true;
	cap: boolean = true;
	finishedAnimating: boolean = false;
	scrollSubscription: any;
	atBottom: boolean = true;
	onlineInterval: any
	displayMsgsSpinner: boolean = true;
	disappearLastDiv: boolean = false;
	items: any[] = [];
	drag: boolean = false;
	caretStart: number = 0;
	caretEnd: number = 0;
	swipeTimeOut: any;
	notificationsHelper: boolean = false;
	image: any;
	stopTimeout: any;
	startTimeout: any;
	canPublish: boolean = true;
	shutInfinite: boolean = false;
	membersIds: any = [];
	logScroll: boolean = false;
	blurTimeout: any;
	loadingMessages: boolean = false;
	unreadMessages: boolean = false;
	colors: string[] = ["#e47006", "#e40606", "#0632e2", "#7500c7", "#1cd00a", "#078e07", "#65473c", "#00bcd4", "#bf2a5d", "#607d8b"];
	private mutationObserver: MutationObserver;
	mention: boolean = false;
	stringToMention: string = "";
	sortedMentions: any[] = [];

	keys: { [key: string]: string[] } = {
		modifier: [
			"Alt", //The Alt (Alternative) key. This key enables the alternate modifier function for interpreting concurrent or subsequent keyboard input. .This key value is also used for the Apple Option key.
			"AltGraph", //The Alternate Graphics (AltGr or AltGraph) key.	This key is used enable the ISO Level 3 shift modifier (the standard Shift key is the level 2 modifier). See  [ISO9995-1].
			"CapsLock", //The Caps Lock (Capital) key.	Toggle capital character lock function for interpreting subsequent keyboard input event.
			"Control", //The Control or Ctrl key, to enable control modifier function for interpreting concurrent or subsequent keyboard input.
			"Fn", //The Function switch Fn key. Activating this key simultaneously with another key changes that key’s value to an alternate character or function. This key is often handled directly in the keyboard hardware and does not usually generate key events.
			"FnLock", //The Function-Lock (FnLock or F-Lock) key.	Activating this key switches the mode of the keyboard to changes some keys' values to an alternate character or function. This key is often handled directly in the keyboard hardware and does not usually generate key events.
			"Meta", //The Meta key, to enable meta modifier function for interpreting concurrent or subsequent keyboard input.	This key value is used for the Windows Logo key and the Apple Command or ⌘ key.
			"NumLock", //The NumLock or Number Lock key, to toggle numpad mode function for interpreting subsequent keyboard input.
			"ScrollLock", //The Scroll Lock key, to toggle between scrolling and cursor movement modes.
			"Shift", //The Shift key, to enable shift modifier function for interpreting concurrent or subsequent keyboard input.
			"Symbol",     //The Symbol modifier key (used on some virtual keyboards).
			"SymbolLock", //The Symbol Lock key.
		],
		legacyModifier: [
			"Hyper", //The Hyper key.
			"Super", //The Super key.
		],
		whiteSpace: [
			"Enter", //The Enter or ↵ key, to activate current selection or accept current input. This key value is also used for the Return (Macintosh numpad) key. This key value is also used for the Android KEYCODE_DPAD_CENTER.
			"Tab", //The Horizontal Tabulation Tab key. The space or spacebar key is encoded as " ".
		],
		navigation: [
			"ArrowDown", //The down arrow key, to navigate or traverse downward. (KEYCODE_DPAD_DOWN)
			"ArrowLeft", //The left arrow key, to navigate or traverse leftward. (KEYCODE_DPAD_LEFT)
			"ArrowRight", //The right arrow key, to navigate or traverse rightward. (KEYCODE_DPAD_RIGHT)
			"ArrowUp", //The up arrow key, to navigate or traverse upward. (KEYCODE_DPAD_UP)
			"End", //The End key, used with keyboard entry to go to the end of content (KEYCODE_MOVE_END).
			"Home", //The Home key, used with keyboard entry, to go to start of content (KEYCODE_MOVE_HOME). For the mobile phone Home key (which goes to the phone’s main screen), use "GoHome".
			"PageDown", //The Page Down key, to scroll down or display next page of content.
			"PageUp", //The Page Up key, to scroll up or display previous page of content.
		],
		editing: [
			"Backspace", //The Backspace key. This key value is also used for the key labeled Delete on MacOS keyboards.
			"Clear", //Remove the currently selected input.
			"Copy", //Copy the current selection. (APPCOMMAND_COPY)
			"CrSel", //The Cursor Select (Crsel) key.
			"Cut", //Cut the current selection. (APPCOMMAND_CUT)
			"Delete", //The Delete (Del) Key.	This key value is also used for the key labeled Delete on MacOS keyboards when modified by the Fn key.
			"EraseEof", //The Erase to End of Field key. This key deletes all characters from the current cursor position to the end of the current field.
			"ExSel", //The Extend Selection (Exsel) key.
			"Insert", //The Insert (Ins) key, to toggle between text modes for insertion or overtyping. (KEYCODE_INSERT)
			"Paste", //The Paste key. (APPCOMMAND_PASTE)
			"Redo", //Redo the last action. (APPCOMMAND_REDO)
			"Undo", //Undo the last action. (APPCOMMAND_UNDO)
		], ui: [
			"Accept", //The Accept (Commit, OK) key. Accept current option or input method sequence conversion.
			"Again", //The Again key, to redo or repeat an action.
			"Attn", //The Attention (Attn) key.
			"Cancel", //The Cancel key.
			"ContextMenu", //Show the application’s context menu.	This key is commonly found between the right Meta key and the right Control key.
			"Escape", //The Esc key. This key was originally used to initiate an escape sequence, but is now more generally used to exit or "escape" the current context, such as closing a dialog or exiting full screen mode.
			"Execute", //The Execute key.
			"Find", //Open the Find dialog. (APPCOMMAND_FIND)
			"Help", //Open a help dialog or toggle display of help information. (APPCOMMAND_HELP, KEYCODE_HELP)
			"Pause", //Pause the current state or application (as appropriate). Do not use this value for the Pause button on media controllers. Use "MediaPause" instead.
			"Play", //Play or resume the current state or application (as appropriate). Do not use this value for the Play button on media controllers. Use "MediaPlay" instead.
			"Props", //The properties (Props) key.
			"Select", //The Select key.
			"ZoomIn", //The ZoomIn key. (KEYCODE_ZOOM_IN)
			"ZoomOut", //The ZoomOut key. (KEYCODE_ZOOM_OUT)
		], device: [
			"BrightnessDown", //The Brightness Down key. Typically controls the display brightness. (KEYCODE_BRIGHTNESS_DOWN)
			"BrightnessUp", //The Brightness Up key. Typically controls the display brightness. (KEYCODE_BRIGHTNESS_UP)
			"Eject", //Toggle removable media to eject (open) and insert (close) state. (KEYCODE_MEDIA_EJECT)
			"LogOff", //The LogOff key.
			"Power", //Toggle power state. (KEYCODE_POWER) Note: Some devices might not expose this key to the operating environment.
			"PowerOff", //The PowerOff key. Sometime called PowerDown.
			"PrintScreen", //The Print Screen or SnapShot key, to initiate print-screen function.
			"Hibernate", //The Hibernate key.	This key saves the current state of the computer to disk so that it can be restored. The computer will then shutdown.
			"Standby", //The Standby key.	This key turns off the display and places the computer into a low-power mode without completely shutting down. It is sometimes labelled Suspend or Sleep key. (KEYCODE_SLEEP)
			"WakeUp", //The WakeUp key. (KEYCODE_WAKEUP)
		], imeCompositionKeys: [
			"AllCandidates", //The All Candidates key, to initate the multi-candidate mode.
			"Alphanumeric", //The Alphanumeric key.
			"CodeInput", //The Code Input key, to initiate the Code Input mode to allow characters to be entered by their code points.
			"Compose", //The Compose key, also known as Multi_key on the X Window System. This key acts in a manner similar to a	dead key, triggering a mode where subsequent key presses are combined to produce a different character.
			"Convert", //The Convert key, to convert the current input method sequence.
			"Dead", //A dead key combining key. It may be any combining key from any keyboard layout. For example, on a	PC/AT French keyboard, using a French mapping and without any modifier activiated, this is the key value U+0302 COMBINING CIRCUMFLEX ACCENT. In another layout this might be a different unicode combining key. For applications that need to differentiate between specific combining characters, the associated compositionupdate event’s data attribute provides the specific key value.
			"FinalMode", //The Final Mode Final key used on some Asian keyboards, to enable the final mode for IMEs.
			"GroupFirst", //Switch to the first character group. (ISO/IEC 9995)
			"GroupLast", //Switch to the last character group. (ISO/IEC 9995)
			"GroupNext", //Switch to the next character group. (ISO/IEC 9995)
			"GroupPrevious", //Switch to the previous character group. (ISO/IEC 9995)
			"ModeChange", //The Mode Change key, to toggle between or cycle through input modes of IMEs.
			"NextCandidate", //The Next Candidate function key.
			"NonConvert", //The NonConvert ("Don’t Convert") key, to accept current input method sequence without conversion in IMEs.
			"PreviousCandidate", //The Previous Candidate function key.
			"Process", //The Process key.
			"SingleCandidate", //The Single Candidate function key.
		], koreanSpecific: [
			"HangulMode", //The Hangul (Korean characters) Mode key, to toggle between Hangul and English modes.
			"HanjaMode", //The Hanja (Korean characters) Mode key.
			"JunjaMode", //The Junja (Korean characters) Mode key.
		], japaneseSpecific: [
			"Eisu", //The Eisu key. This key may close the IME, but its purpose	is defined by the current IME. (KEYCODE_EISU)
			"Hankaku", //The (Half-Width) Characters key.
			"Hiragana", //The Hiragana (Japanese Kana characters) key.
			"HiraganaKatakana", //The Hiragana/Katakana toggle key. (KEYCODE_KATAKANA_HIRAGANA)
			"KanaMode", //The Kana Mode (Kana Lock) key. This key is used to enter	hiragana mode (typically from romaji mode).
			"KanjiMode", //The Kanji (Japanese name for ideographic characters of Chinese origin) Mode key.	This key is typically used to switch to a hiragana keyboard for the purpose of converting input into kanji. (KEYCODE_KANA)
			"Katakana", //The Katakana (Japanese Kana characters) key.
			"Romaji", //The Roman characters function key.
			"Zenkaku", //The Zenkaku (Full-Width) Characters key.
			"ZenkakuHankaku", //The Zenkaku/Hankaku (full-width/half-width) toggle key. (KEYCODE_ZENKAKU_HANKAKU)
		],
		// The exact number of these general purpose function keys varies on different platforms, and only the first few are defined explicitly here. Additional function key names are implicitly defined by incrementing the base-10 index at the end of the function key name. Thus, "F24" and "Soft8" are all valid key values.
		commonFunction: [
			"F1", //The F1 key, a general purpose function key, as index 1.
			"F2", //The F2 key, a general purpose function key, as index 2.
			"F3", //The F3 key, a general purpose function key, as index 3.
			"F4", //The F4 key, a general purpose function key, as index 4.
			"F5", //The F5 key, a general purpose function key, as index 5.
			"F6", //The F6 key, a general purpose function key, as index 6.
			"F7", //The F7 key, a general purpose function key, as index 7.
			"F8", //The F8 key, a general purpose function key, as index 8.
			"F9", //The F9 key, a general purpose function key, as index 9.
			"F10", //The F10 key, a general purpose function key, as index 10.
			"F11", //The F11 key, a general purpose function key, as index 11.
			"F12", //The F12 key, a general purpose function key, as index 12.
			"Soft1", //General purpose virtual function key, as index 1.
			"Soft2", //General purpose virtual function key, as index 2.
			"Soft3", //General purpose virtual function key, as index 3.
			"Soft4", //General purpose virtual function key, as index 4.
		],
		// These are extra keys found on "multimedia" keyboards.
		multimedia: [
			"ChannelDown", //Select next (numerically or logically) lower channel. (APPCOMMAND_MEDIA_CHANNEL_DOWN, KEYCODE_CHANNEL_DOWN)
			"ChannelUp", //Select next (numerically or logically) higher channel. (APPCOMMAND_MEDIA_CHANNEL_UP, KEYCODE_CHANNEL_UP)
			"Close", //Close the current document or message (Note: This doesn’t close the application). (APPCOMMAND_CLOSE)
			"MailForward", //Open an editor to forward the current message. (APPCOMMAND_FORWARD_MAIL)
			"MailReply", //Open an editor to reply to the current message. (APPCOMMAND_REPLY_TO_MAIL)
			"MailSend", //Send the current message. (APPCOMMAND_SEND_MAIL)
			"MediaClose", //Close the current media, for example to close a CD or DVD tray. (KEYCODE_MEDIA_CLOSE)
			"MediaFastForward", //Initiate or continue forward playback at faster than normal speed, or increase speed if already fast forwarding. (APPCOMMAND_MEDIA_FAST_FORWARD, KEYCODE_MEDIA_FAST_FORWARD)
			"MediaPause", //Pause the currently playing media. (APPCOMMAND_MEDIA_PAUSE, KEYCODE_MEDIA_PAUSE) Media controller devices should use this value rather than "Pause" for their pause keys.
			"MediaPlay", //Initiate or continue media playback at normal speed, if not currently playing at normal speed. (APPCOMMAND_MEDIA_PLAY, KEYCODE_MEDIA_PLAY)
			"MediaPlayPause", //Toggle media between play and pause states. (APPCOMMAND_MEDIA_PLAY_PAUSE, KEYCODE_MEDIA_PLAY_PAUSE)
			"MediaRecord", //Initiate or resume recording of currently selected media. (APPCOMMAND_MEDIA_RECORD, KEYCODE_MEDIA_RECORD)
			"MediaRewind", //Initiate or continue reverse playback at faster than normal speed, or increase speed if already rewinding. (APPCOMMAND_MEDIA_REWIND, KEYCODE_MEDIA_REWIND)
			"MediaStop", //Stop media playing, pausing, forwarding, rewinding, or recording, if not already stopped. (APPCOMMAND_MEDIA_STOP, KEYCODE_MEDIA_STOP)
			"MediaTrackNext", //Seek to next media or program track. (APPCOMMAND_MEDIA_NEXTTRACK, KEYCODE_MEDIA_NEXT)
			"MediaTrackPrevious", //Seek to previous media or program track. (APPCOMMAND_MEDIA_PREVIOUSTRACK, KEYCODE_MEDIA_PREVIOUS)
			"New", //Open a new document or message. (APPCOMMAND_NEW)
			"Open", //Open an existing document or message. (APPCOMMAND_OPEN)
			"Print", //Print the current document or message. (APPCOMMAND_PRINT)
			"Save", //Save the current document or message. (APPCOMMAND_SAVE)
			"SpellCheck", //Spellcheck the current document or selection. (APPCOMMAND_SPELL_CHECK)
		],
		// The normal 0 ... 9 numpad keys are encoded as "0" ... "9", but some multimedia keypads have buttons numbered from 1 ... 12. In these instances, the 10 key is often labeled 10 /0. Note: The 10 or 10 /0 key MUST be assigned a key value of "0".
		multimediaNumpad: [
			"Key11", //The 11 key found on media numpads that	have buttons from 1 ... 12.
			"Key12", //The 12 key found on media numpads that	have buttons from 1 ... 12.
		],
		// Multimedia keys related to audio.
		audio: [
			"AudioBalanceLeft", //Adjust audio balance leftward. (VK_AUDIO_BALANCE_LEFT)
			"AudioBalanceRight", //Adjust audio balance rightward. (VK_AUDIO_BALANCE_RIGHT)
			"AudioBassBoostDown", //Decrease audio bass boost or cycle down through bass boost states. (APPCOMMAND_BASS_DOWN, VK_BASS_BOOST_DOWN)
			"AudioBassBoostToggle", //Toggle bass boost on/off. (APPCOMMAND_BASS_BOOST)
			"AudioBassBoostUp", //Increase audio bass boost or cycle up through bass boost states. (APPCOMMAND_BASS_UP, VK_BASS_BOOST_UP)
			"AudioFaderFront", //Adjust audio fader towards front. (VK_FADER_FRONT)
			"AudioFaderRear", //Adjust audio fader towards rear. (VK_FADER_REAR)
			"AudioSurroundModeNext", //Advance surround audio mode to next available mode. (VK_SURROUND_MODE_NEXT)
			"AudioTrebleDown", //Decrease treble. (APPCOMMAND_TREBLE_DOWN)
			"AudioTrebleUp", //Increase treble. (APPCOMMAND_TREBLE_UP)
			"AudioVolumeDown", //Decrease audio volume. (APPCOMMAND_VOLUME_DOWN, KEYCODE_VOLUME_DOWN)
			"AudioVolumeUp", //Increase audio volume. (APPCOMMAND_VOLUME_UP, KEYCODE_VOLUME_UP)
			"AudioVolumeMute", //Toggle between muted state and prior volume level. (APPCOMMAND_VOLUME_MUTE, KEYCODE_VOLUME_MUTE)
			"MicrophoneToggle", //Toggle the microphone on/off. (APPCOMMAND_MIC_ON_OFF_TOGGLE)
			"MicrophoneVolumeDown", //Decrease microphone volume. (APPCOMMAND_MICROPHONE_VOLUME_DOWN)
			"MicrophoneVolumeUp", //Increase microphone volume. (APPCOMMAND_MICROPHONE_VOLUME_UP)
			"MicrophoneVolumeMute", //Mute the microphone. (APPCOMMAND_MICROPHONE_VOLUME_MUTE, KEYCODE_MUTE)
		],
		// Multimedia keys related to speech recognition.
		speech: [
			"SpeechCorrectionList", //Show correction list when a word is incorrectly identified. (APPCOMMAND_CORRECTION_LIST)
			"SpeechInputToggle", //Toggle between dictation mode and command/control mode. (APPCOMMAND_DICTATE_OR_COMMAND_CONTROL_TOGGLE)
		],
		// The Application Keys are special keys that are assigned to launch a particular application. Additional application key names can be defined by concatenating "Launch" with the name of the application.
		application: [
			"LaunchApplication1", //The first generic "LaunchApplication" key. This is commonly associated with launching "My Computer", and may have a computer symbol on the key. (APPCOMMAND_LAUNCH_APP1)
			"LaunchApplication2", //The second generic "LaunchApplication" key. This is commonly associated with launching "Calculator", and may have a calculator symbol on the key. (APPCOMMAND_LAUNCH_APP2, KEYCODE_CALCULATOR)
			"LaunchCalendar", //The "Calendar" key. (KEYCODE_CALENDAR)
			"LaunchContacts", //The "Contacts" key. (KEYCODE_CONTACTS)
			"LaunchMail", //The "Mail" key. (APPCOMMAND_LAUNCH_MAIL)
			"LaunchMediaPlayer", //The "Media Player" key. (APPCOMMAND_LAUNCH_MEDIA_SELECT)
			"LaunchMusicPlayer", //The "Music Player" key.
			"LaunchPhone", //The "Phone" key.
			"LaunchScreenSaver", //The "Screen Saver" key.
			"LaunchSpreadsheet", //The "Spreadsheet" key.
			"LaunchWebBrowser", //The "Web Browser" key.
			"LaunchWebCam", //The "WebCam" key.
			"LaunchWordProcessor", //The "Word Processor" key.
		],
		browser: [
			"BrowserBack", //Navigate to previous content or page in current history. (APPCOMMAND_BROWSER_BACKWARD)
			"BrowserFavorites", //Open the list of browser favorites. (APPCOMMAND_BROWSER_FAVORITES)
			"BrowserForward", //Navigate to next content or page in current history. (APPCOMMAND_BROWSER_FORWARD)
			"BrowserHome", //Go to the user’s preferred home page. (APPCOMMAND_BROWSER_HOME)
			"BrowserRefresh", //Refresh the current page or content. (APPCOMMAND_BROWSER_REFRESH)
			"BrowserSearch", //Call up the user’s preferred search page. (APPCOMMAND_BROWSER_SEARCH)
			"BrowserStop", //Stop loading the current page or content. (APPCOMMAND_BROWSER_STOP)
		],
		mobilePhone: [
			"AppSwitch", //The Application switch key, which provides a list of recent apps to switch between. (KEYCODE_APP_SWITCH)
			"Call", //The Call key. (KEYCODE_CALL)
			"Camera", //The Camera key. (KEYCODE_CAMERA)
			"CameraFocus", //The Camera focus key. (KEYCODE_FOCUS)
			"EndCall", //The End Call key. (KEYCODE_ENDCALL)
			"GoBack", //The Back key. (KEYCODE_BACK)
			"GoHome", //The Home key, which goes to the phone’s main screen. (KEYCODE_HOME)
			"HeadsetHook", //The Headset Hook key. (KEYCODE_HEADSETHOOK)
			"LastNumberRedial", //The Last Number Redial key.
			"Notification", //The Notification key. (KEYCODE_NOTIFICATION)
			"MannerMode", //Toggle between manner mode state: silent, vibrate, ring, ... (KEYCODE_MANNER_MODE)
			"VoiceDial", //The Voice Dial key.
		], tv: [
			"TV", //Switch to viewing TV. (KEYCODE_TV)
			"TV3DMode", //TV 3D Mode. (KEYCODE_3D_MODE)
			"TVAntennaCable", //Toggle between antenna and cable input. (KEYCODE_TV_ANTENNA_CABLE)
			"TVAudioDescription", //Audio description. (KEYCODE_TV_AUDIO_DESCRIPTION)
			"TVAudioDescriptionMixDown", //Audio description mixing volume down. (KEYCODE_TV_AUDIO_DESCRIPTION_MIX_DOWN)
			"TVAudioDescriptionMixUp", //Audio description mixing volume up. (KEYCODE_TV_AUDIO_DESCRIPTION_MIX_UP)
			"TVContentsMenu", //Contents menu. (KEYCODE_TV_CONTENTS_MENU)
			"TVDataService", //Contents menu. (KEYCODE_TV_DATA_SERVICE)
			"TVInput", //Switch the input mode on an external TV. (KEYCODE_TV_INPUT)
			"TVInputComponent1", //Switch to component input #1. (KEYCODE_TV_INPUT_COMPONENT_1)
			"TVInputComponent2", //Switch to component input #2. (KEYCODE_TV_INPUT_COMPONENT_2)
			"TVInputComposite1", //Switch to composite input #1. (KEYCODE_TV_INPUT_COMPOSITE_1)
			"TVInputComposite2", //Switch to composite input #2. (KEYCODE_TV_INPUT_COMPOSITE_2)
			"TVInputHDMI1", //Switch to HDMI input #1. (KEYCODE_TV_INPUT_HDMI_1)
			"TVInputHDMI2", //Switch to HDMI input #2. (KEYCODE_TV_INPUT_HDMI_2)
			"TVInputHDMI3", //Switch to HDMI input #3. (KEYCODE_TV_INPUT_HDMI_3)
			"TVInputHDMI4", //Switch to HDMI input #4. (KEYCODE_TV_INPUT_HDMI_4)
			"TVInputVGA1", //Switch to VGA input #1. (KEYCODE_TV_INPUT_VGA_1)
			"TVMediaContext", //Media context menu. (KEYCODE_TV_MEDIA_CONTEXT_MENU)
			"TVNetwork", //Toggle network. (KEYCODE_TV_NETWORK)
			"TVNumberEntry", //Number entry. (KEYCODE_TV_NUMBER_ENTRY)
			"TVPower", //Toggle the power on an external TV. (KEYCODE_TV_POWER)
			"TVRadioService", //Radio. (KEYCODE_TV_RADIO_SERVICE)
			"TVSatellite", //Satellite. (KEYCODE_TV_SATELLITE)
			"TVSatelliteBS", //Broadcast Satellite. (KEYCODE_TV_SATELLITE_BS)
			"TVSatelliteCS", //Communication Satellite. (KEYCODE_TV_SATELLITE_CS)
			"TVSatelliteToggle", //Toggle between available satellites. (KEYCODE_TV_SATELLITE_SERVICE)
			"TVTerrestrialAnalog", //Analog Terrestrial. (KEYCODE_TV_TERRESTRIAL_ANALOG)
			"TVTerrestrialDigital", //Digital Terrestrial. (KEYCODE_TV_TERRESTRIAL_DIGITAL)
			"TVTimer", //Timer programming. (KEYCODE_TV_TIMER_PROGRAMMING)
		],
		// The key attribute values for media controllers (e.g. remote controls for television, audio systems, and set-top boxes) are derived in part from the consumer electronics technical specifications:
		mediaControls: [
			"AVRInput", //Switch the input mode on an external AVR (audio/video receiver). (KEYCODE_AVR_INPUT)
			"AVRPower", //Toggle the power on an external AVR (audio/video receiver). (KEYCODE_AVR_POWER)
			"ColorF0Red", //General purpose color-coded media function key, as index 0 (red). (VK_COLORED_KEY_0, KEYCODE_PROG_RED)
			"ColorF1Green", //General purpose color-coded media function key, as index 1 (green). (VK_COLORED_KEY_1, KEYCODE_PROG_GREEN)
			"ColorF2Yellow", //General purpose color-coded media function key, as index 2 (yellow). (VK_COLORED_KEY_2, KEYCODE_PROG_YELLOW)
			"ColorF3Blue", //General purpose color-coded media function key, as index 3 (blue). (VK_COLORED_KEY_3, KEYCODE_PROG_BLUE)
			"ColorF4Grey", //General purpose color-coded media function key, as index 4 (grey). (VK_COLORED_KEY_4)
			"ColorF5Brown", //General purpose color-coded media function key, as index 5 (brown). (VK_COLORED_KEY_5)
			"ClosedCaptionToggle", //Toggle the display of Closed Captions. (VK_CC, KEYCODE_CAPTIONS)
			"Dimmer", //Adjust brightness of device, by toggling between or cycling through states. (VK_DIMMER)
			"DisplaySwap", //Swap video sources. (VK_DISPLAY_SWAP)
			"DVR", //Select Digital Video Rrecorder. (KEYCODE_DVR)
			"Exit", //Exit the current application. (VK_EXIT)
			"FavoriteClear0", //Clear program or content stored as favorite 0. (VK_CLEAR_FAVORITE_0)
			"FavoriteClear1", //Clear program or content stored as favorite 1. (VK_CLEAR_FAVORITE_1)
			"FavoriteClear2", //Clear program or content stored as favorite 2. (VK_CLEAR_FAVORITE_2)
			"FavoriteClear3", //Clear program or content stored as favorite 3. (VK_CLEAR_FAVORITE_3)
			"FavoriteRecall0", //Select (recall) program or content stored as favorite 0. (VK_RECALL_FAVORITE_0)
			"FavoriteRecall1", //Select (recall) program or content stored as favorite 1. (VK_RECALL_FAVORITE_1)
			"FavoriteRecall2", //Select (recall) program or content stored as favorite 2. (VK_RECALL_FAVORITE_2)
			"FavoriteRecall3", //Select (recall) program or content stored as favorite 3. (VK_RECALL_FAVORITE_3)
			"FavoriteStore0", //Store current program or content as favorite 0. (VK_STORE_FAVORITE_0)
			"FavoriteStore1", //Store current program or content as favorite 1. (VK_STORE_FAVORITE_1)
			"FavoriteStore2", //Store current program or content as favorite 2. (VK_STORE_FAVORITE_2)
			"FavoriteStore3", //Store current program or content as favorite 3. (VK_STORE_FAVORITE_3)
			"Guide", //Toggle display of program or content guide. (VK_GUIDE, KEYCODE_GUIDE)
			"GuideNextDay", //If guide is active and displayed, then display next day’s content. (VK_NEXT_DAY)
			"GuidePreviousDay", //If guide is active and displayed, then display previous day’s content. (VK_PREV_DAY)
			"Info", //Toggle display of information about currently selected context or media. (VK_INFO, KEYCODE_INFO)
			"InstantReplay", //Toggle instant replay. (VK_INSTANT_REPLAY)
			"Link", //Launch linked content, if available and appropriate. (VK_LINK)
			"ListProgram", //List the current program. (VK_LIST)
			"LiveContent", //Toggle display listing of currently available live content or programs. (VK_LIVE)
			"Lock", //Lock or unlock current content or program. (VK_LOCK)
			"MediaApps", //Show a list of media applications: audio/video players and image viewers. (VK_APPS) Do not confuse this key value with the Windows' VK_APPS / VK_CONTEXT_MENU key, which is encoded as "ContextMenu".
			"MediaAudioTrack", //Audio track key. (KEYCODE_MEDIA_AUDIO_TRACK)
			"MediaLast", //Select previously selected channel or media. (VK_LAST, KEYCODE_LAST_CHANNEL)
			"MediaSkipBackward", //Skip backward to next content or program. (KEYCODE_MEDIA_SKIP_BACKWARD)
			"MediaSkipForward", //Skip forward to next content or program. (VK_SKIP, KEYCODE_MEDIA_SKIP_FORWARD)
			"MediaStepBackward", //Step backward to next content or program. (KEYCODE_MEDIA_STEP_BACKWARD)
			"MediaStepForward", //Step forward to next content or program. (KEYCODE_MEDIA_STEP_FORWARD)
			"MediaTopMenu", //Media top menu. (KEYCODE_MEDIA_TOP_MENU)
			"NavigateIn", //Navigate in. (KEYCODE_NAVIGATE_IN)
			"NavigateNext", //Navigate to next key. (KEYCODE_NAVIGATE_NEXT)
			"NavigateOut", //Navigate out. (KEYCODE_NAVIGATE_OUT)
			"NavigatePrevious", //Navigate to previous key. (KEYCODE_NAVIGATE_PREVIOUS)
			"NextFavoriteChannel", //Cycle to next favorite channel (in favorites list). (VK_NEXT_FAVORITE_CHANNEL)
			"NextUserProfile", //Cycle to next user profile (if there are multiple user profiles). (VK_USER)
			"OnDemand", //Access on-demand content or programs. (VK_ON_DEMAND)
			"Pairing", //Pairing key to pair devices. (KEYCODE_PAIRING)
			"PinPDown", //Move picture-in-picture window down. (VK_PINP_DOWN)
			"PinPMove", //Move picture-in-picture window. (VK_PINP_MOVE)
			"PinPToggle", //Toggle display of picture-in-picture window. (VK_PINP_TOGGLE)
			"PinPUp", //Move picture-in-picture window up. (VK_PINP_UP)
			"PlaySpeedDown", //Decrease media playback speed. (VK_PLAY_SPEED_DOWN)
			"PlaySpeedReset", //Reset playback to normal speed. (VK_PLAY_SPEED_RESET)
			"PlaySpeedUp", //Increase media playback speed. (VK_PLAY_SPEED_UP)
			"RandomToggle", //Toggle random media or content shuffle mode. (VK_RANDOM_TOGGLE)
			"RcLowBattery", //Not a physical key, but this key code is sent when the remote control battery is low. (VK_RC_LOW_BATTERY)
			"RecordSpeedNext", //Toggle or cycle between media recording speeds. (VK_RECORD_SPEED_NEXT)
			"RfBypass", //Toggle RF (radio frequency) input bypass mode (pass RF input directly to the RF output). (VK_RF_BYPASS)
			"ScanChannelsToggle", //Toggle scan channels mode. (VK_SCAN_CHANNELS_TOGGLE)
			"ScreenModeNext", //Advance display screen mode to next available mode. (VK_SCREEN_MODE_NEXT)
			"Settings", //Toggle display of device settings screen. (VK_SETTINGS, KEYCODE_SETTINGS)
			"SplitScreenToggle", //Toggle split screen mode. (VK_SPLIT_SCREEN_TOGGLE)
			"STBInput", //Switch the input mode on an external STB (set top box). (KEYCODE_STB_INPUT)
			"STBPower", //Toggle the power on an external STB (set top box). (KEYCODE_STB_POWER)
			"Subtitle", //Toggle display of subtitles, if available. (VK_SUBTITLE)
			"Teletext", //Toggle display of teletext, if available (VK_TELETEXT, KEYCODE_TV_TELETEXT).
			"VideoModeNext", //Advance video mode to next available mode. (VK_VIDEO_MODE_NEXT)
			"Wink", //Cause device to identify itself in some manner, e.g., audibly or visibly. (VK_WINK)
			"ZoomToggle", //Toggle between full-screen and scaled content, or alter magnification level. (VK_ZOOM, KEYCODE_TV_ZOOM_MODE)
		]
	};
	allKeys: any;

	mutationRegistered: boolean = false;



	constructor(private authService: AuthService,
		private toastCtrl: ToastController,
		private keyboard: Keyboard,
		private el: ElementRef,
		private router: Router,
		private storage: Storage,
		private route: ActivatedRoute,
		private loadingCtrl: LoadingController,
		public global: AppState,
		private webSocketService: WebSocketService,
		private navCtrl: NavController, public chatService: ChatService) {

		this.id = this.route.snapshot.paramMap.get('id');
		this.chat = this.chatService.getChat(this.id);


	}


	checkIfNotificationsHelper() {
		this.storage.get('chat-notifications-helper').then((val) => {
			if (!val) this.notificationsHelper = true;
		})
	}

	setNotificationsHelper() {
		this.storage.set('chat-notifications-helper', '1')
		this.notificationsHelper = false;
	}

	isKeyPrintable(e: KeyboardEvent) {
		return this.allKeys.indexOf(e.key) === -1;
	}

	mentionUsers() {
		this.allKeys = Object.keys(this.keys).reduce((acc, category) => {
			return [...acc, ...this.keys[category]]
		}, [] as string[]);
		
		
			

	}


	typingIndicator() {
		let firstScroll = true; //la primera vez que se carga la pagina, esta fun hace que se baje la pantalla
		//hay que evitar que se baje la primera vez
		this.scrollSubscription = this.chatService.observableTyping
			.subscribe(scroll => {

				if (!firstScroll) {
					setTimeout(() => { //en lo que sube el letrero
						if (scroll && this.atBottom) {
							this.content.scrollToBottom(100).then(() => {
								this.atBottom = true;

							})
						}
					}, 150);
				}
				firstScroll = false; //se cambia la variable para que ya se pueda cambiar
			});
	}

	ionViewDidLeave() {
		this.content.scrollY = false
		this.chatService.currentChatId = "";
		clearTimeout(this.swipeTimeOut);
		this.authService.swipeBack = true;
	}



	goToTabRoot() {
		this.navCtrl.navigateRoot(this.router.url.substr(0, 10))
	}


	ionViewDidEnter() {



		if (!this.chat) return this.goToTabRoot(); //cordova kill

		setTimeout(() => {
			this.chatService.currentChatId = this.chat._id;
		}, 500);

		setTimeout(() => {
			this.content.scrollY = true

		}, 100);
		this.finishedAnimating = true;
		if (this.chat.typing && this.atBottom) {
			setTimeout(() => {
				this.content.scrollToBottom(150)
			}, 500);

		}
		let el = this.sendButton.nativeElement;

		el.addEventListener('click', (event) => {
			this.stopBubble(event);
		});
		el.addEventListener('mousedown', (event) => {
			this.stopBubble(event);
		});
		el.addEventListener('touchdown', (event) => {
			this.stopBubble(event);
		});
		el.addEventListener('touchmove', (event) => {
			this.stopBubble(event);
		});
		el.addEventListener('touchstart', (event) => {
			this.stopBubble(event);
		});
		el.addEventListener('touchend', (event) => { //Triggered by a phone
			this.stopBubble(event);
			this.handleState()
		});
		el.addEventListener('mouseup', (event) => {
			this.stopBubble(event); //Triggered by the browser
			this.handleState();
		});

		if (this.chat._id != "empty") {
			this.checkIfOnline();
			clearInterval(this.onlineInterval)
			this.onlineInterval = setInterval(() => {
				this.checkIfOnline();
			}, 10000);
		}


	}



	stopBubble(event) {
		event.preventDefault();
		event.stopPropagation()

	}

	addLastMessageToUserDocument() {

		
		if (this.chat.lastMessage && this.chat.lastMessage._id) {
			this.authService.addLastMessage(this.chat.lastMessage._id, this.chat._id)
		
			
		}


	}


	ngOnDestroy() {

		
		clearInterval(this.onlineInterval)

		if (!this.chat) return; //cordova kill
		if (this.chat.room) this.addLastMessageToUserDocument();
		if (this.mutationObserver) this.mutationObserver.disconnect()

		if (!this.chat.room) {
			if (this.chat._id != "empty") {
				this.chatService.markAsRead(this.chat._id);
				for (let index = 0; index < this.chatService.chats.length; index++) {
					if (this.chatService.chats[index]._id == this.chat._id) {
						this.chatService.chats[index].lastMessageTime = this.chatService.chats[index].lastMessage ? this.created(new Date(this.chatService.chats[index].lastMessage.createdAt)) : this.created(new Date(this.chatService.chats[index].createdAt))
						this.chatService.chats[index].unreadMessageCount = 0;
						break;
					}
				}
			}

			if (this.chatService.channelMessages[this.chat._id]) {
				this.chatService.channelMessages[this.chat._id] = this.chatService.channelMessages[this.chat._id].concat().reverse().slice(0, 30);
				let messagesToLocal = this.chatService.channelMessages[this.chat._id];
				messagesToLocal.reverse();
				if (messagesToLocal.length > 0) this.storage.set(this.chat._id, JSON.stringify(messagesToLocal));
			}

			this.chatService.determineChatNotifications();
		} else {
			this.chatService.channelMessages[this.chat._id] = [];
			this.chat.members = [];
		
			this.chatService.currenChatRoom = "";
		}

		if (this.scrollSubscription) this.scrollSubscription.unsubscribe();


	}


	ngOnInit() {


		if (!this.chat) return this.goToTabRoot(); //cordova kill
		this.mentionUsers();

		if (!this.chat.room) {
			if (this.chat.unreadMessageCount > 0) this.unreadMessages = true;
			
			if (this.chat._id != "empty") {
				this.chatService.markAsRead(this.chat._id);
				this.membersIds = this.chat.members.map(member => member._id || member);
				this.getMessages();
			}
			if (this.chat.customType == "general-group" || this.chat.customType == "team-group" || this.chat.customType == "sport-group") {
				this.chatName = this.chat.name;
				this.chat.chatName = this.chatName;
				this.chat.otherUserPicture = this.chat.coverUrl;


			} else {

				if (!this.chat.recipient) {

					for (let index = 0; index < this.chat.members.length; index++) {
						let member = this.chat.members[index];
						if (member._id != this.authService.currentUser._id) {
							this.otherUser = member
							break;
						}

					}
					this.chatName = this.otherUser.username;
					this.chat.chatName = this.chatName
					this.chat.otherUserPicture = this.otherUser.profilePicture;
				} else {
					this.chatName = this.chat.recipient.username;
					this.chat.chatName = this.chatName;
					this.chat.otherUserPicture = this.chat.recipient.profilePicture;
					this.otherUser = this.chat.recipient;

				}
			}

		} else {

			
			

			this.chat.otherUserPicture = 'assets/imgs/group.png';

			this.hideTopSpinner = true;
			this.chatService.currenChatRoom = this.chat._id;

			this.checkIfNotificationsHelper();
			this.getMessages();
		}



		

		setTimeout(() => {
			this.logScroll = true;
		}, 1000);

		this.keyBooardHandler();

	}


	thirtyMessages() {

		setTimeout(() => { //en lo que baja
			if (this.chatService.channelMessages[this.chat._id].length > 30) {
				let cut = this.chatService.channelMessages[this.chat._id].length - 30;
				this.chatService.channelMessages[this.chat._id].splice(0, cut);

				this.displayMsgsSpinner = true;
			}
		}, 500);




	}



	keyBooardHandler() {


		window.addEventListener('keyboardDidShow', () => {
			setTimeout(() => {
				this.content.scrollToBottom(250).then(() => {
					this.atBottom = true;
				})
			}, 50);
		});

	}


	ionViewWillLeave() {

		if (!this.chat) return this.goToTabRoot(); //cordova kill


		
			this.disappearLastDiv = true
			this.chat.typing = '';
			this.chat.usernameTyping = '';
			this.chatService.sortChats();
		

		clearTimeout(this.swipeTimeOut);
		this.authService.swipeBack = false;

		this.swipeTimeOut = setTimeout(() => {
			this.authService.swipeBack = true;
		}, 1500);

	}

	registerMutation() {

		if (!this.mutationRegistered) {
			setTimeout(() => {
				if (this.unreadMessages && this.scrollToUndread) {
					this.scrollToUnread();
					this.scrollToUndread = false;

				}
				else {
					if (this.atBottom) {
						this.content.scrollToBottom().then(() => {
							this.atBottom = true;
							
							if (!this.scrollSubscription) this.typingIndicator();

						});

					}
				}
				this.mutationObserverCall();
				this.mutationRegistered = true;
			}, 0);
		}




	}

	mutationObserverCall() {

		this.mutationObserver = new MutationObserver((mutations) => {

			if (this.unreadMessages && this.scrollToUndread) {
				
				this.scrollToUnread();
				this.scrollToUndread = false;
			}
			else {

				if (this.atBottom) {

					this.content.scrollToBottom(300).then(() => {
					
						this.atBottom = true;
					});

				}
			}

		});

		this.mutationObserver.observe(this.chatList.nativeElement, {
			childList: true
		});
	}

	getPosition(element) {

		var xPosition = 0;
		var yPosition = 0;

		while (element) {

			xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
			yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
			element = element.offsetParent;

		}

		return { x: xPosition, y: yPosition };
	}

	scrollAtTheBottom() {
		var bounding = this.el.nativeElement.querySelectorAll('.last')[0].getBoundingClientRect();

		return (
			bounding.top >= 0 &&
			bounding.left >= 0 &&
			bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
		);


	}



	scrollToUnread() {

		if (!this.chat.room) {
			let yOffset = this.getPosition(document.getElementById("unread-div")).y - 65;
			this.content.scrollToPoint(0, yOffset, 0).then(() => {
				setTimeout(() => {
					if (!this.scrollSubscription) this.typingIndicator();
					this.atBottom = this.scrollAtTheBottom();
				}, 1000);

			})
		} else {
			let yOffset = this.getPosition(document.getElementById("unread-div")).y - 65;
			this.content.scrollToPoint(0, yOffset, 300).then(() => {
				setTimeout(() => {
					if (!this.scrollSubscription) this.typingIndicator();
					this.atBottom = this.scrollAtTheBottom();
				}, 1000);

			})
		}





	}





	checkIfOnline() {
		if (this.chat.customType == '1-1') {
			this.chatService.checkIfOnline(this.chat._id)
				.subscribe((chat: any) => {

					for (let index = 0; index < chat.members.length; index++) {
						const member = chat.members[index];
						if (member._id != this.authService.currentUser._id) {
							if (member.lastSeenAt != undefined) {
								if (member.lastSeenAt != 0) {
									this.chat.online = false;
									this.chat.lastSeenAt = this.created(new Date(member.lastSeenAt))
									break;
								} else {
									this.chat.lastSeenAt = "";
									this.chat.online = true;
									break;
								}
							}
						}
					}
				})

			this.toastCtrl.create({
				message: '',
				duration: 1000,
				cssClass: 'cheat-toast',
				position: 'bottom'
			}).then(toast => {
				toast.present();
			})
		}
	}





	logScrolling(event: any) {


		if (this.logScroll) {

			this.atBottom = this.scrollAtTheBottom()

			if (event.detail.scrollTop < 75 && this.chatService.channelMessages[this.chat._id].length >= 30 && !this.loadingMessages && !this.shutInfinite) {
				this.loadingMessages = true;
				this.shutInfinite = true;
				this.getMoreMessages(event);
				//Para hacer que el usuario llegue al final y (engaño)


			}
		}

	}

	getMoreMessages(event) {

		let limit = 30;
		this.skip = this.chatService.channelMessages[this.chat._id].length;
		this.chatService.getMessagesForChat(this.chat._id, this.skip, limit)
			.subscribe((messages) => {

				this.content.scrollY = false;
				setTimeout(() => {
					this.content.getScrollElement().then(co => {

						let messagesUnique = messages.filter((el) => {
							return this.chatService.channelMessages[this.chat._id].indexOf(el) < 0;
						});


						let prevPosition = co.scrollHeight - (!event.detail.scrollTop ? event.detail.scrollTop + 1 : event.detail.scrollTop);

						this.chatService.channelMessages[this.chat._id].unshift(...messagesUnique)


						setTimeout(() => {
							let scrollY = co.scrollHeight - prevPosition;
							this.content.scrollToPoint(0, scrollY)
							this.content.scrollY = true;
						}, 0);

						this.loadingMessages = false;
						if (messages.length < 30) {
							this.shutInfinite = true;
							this.displayMsgsSpinner = false
						}
						else {
							setTimeout(() => {
								this.shutInfinite = false;

							}, 1000); //para que no se bajen de inmediato otra vez 

						}
					})
				}, 400);


			},
				(err) => {
					this.toastCtrl.create({
						message: 'Error fetching messages, please try again later',
						duration: 3000,
						position: 'bottom'
					}).then(toast => {
						toast.present();
						this.loadingMessages = false;
					})
				})
	}




	getMessages() {

		let limit;
		if (!this.chat.room) {
			limit = (this.chat.unreadMessageCount > 30 && this.chat.unreadMessageCount < 100) ? this.chat.unreadMessageCount : 30;
		} else {
			limit = 50;
		}

		this.chatService.getMessagesForChat(this.chat._id, 0, limit)
			.subscribe((messages) => {

			


				let localMess;

				let dbMess;
				if (messages.length > 0) {
					if (this.chatService.channelMessages[this.chat._id]) {
						localMess = this.chatService.channelMessages[this.chat._id].concat().reverse().slice(0, 30).map(e => e.message);
					} else {
						localMess = [];
					}
					dbMess = messages.concat().reverse().slice(0, 30).map(e => e.message)

					if (dbMess.sort().join(',') === localMess.sort().join(',')) {
						this.hideTopSpinner = false;
						//equal



					} else {



						if (this.authService.currentUser.rooms.length) {
							let room = this.authService.currentUser.rooms.find(room => room.chat == this.chat._id)

							if(room) {
								let unreadIndex = messages.findIndex(msg => msg._id == room.lastMessage) + 1
								if (unreadIndex > 0) {
									this.chat.unreadMessageCount = messages.length - unreadIndex;
									if (this.chat.unreadMessageCount > 0) this.unreadMessages = true;
	
	
								}
							}
							
						}


						setTimeout(() => {
							if (this.unreadMessages) this.scrollToUndread = true;
							
							this.chatService.channelMessages[this.chat._id] = messages;
							this.addMembersThroughMessages(messages, this.chat);
							
							if (!this.unreadMessages) this.content.scrollToBottom(0).then(() => {

								if(this.chat.room) {
									this.hideTopSpinner = false; //para que no salga al principio
									this.content.scrollToBottom(0)
								}
								
							});
							setTimeout(() => {

							}, 1000);

						}, 400);
					}

				}

			},
				(err) => {

				})
	}

	addMembersThroughMessages(messages: any[], chat: any) { //para rooms

		let members = messages.map(msg => msg.user);
		let membersFiltered = members.filter((a, b) => members.findIndex(_a => _a._id == a._id ) === b);
		let chatM = chat.members.concat(membersFiltered);
		let chatMFiltered =  chatM.filter((a, b) => chatM.findIndex(_a => _a._id == a._id ) === b);
		
		chat.members = chatMFiltered;
		
	
       	
	}

	

	onChange(event: EventTarget) {

		this.loadingCtrl.create({
			spinner: 'crescent',
			cssClass: 'my-custom-loading',
		}).then(loader => {
			loader.present()
			let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
			let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
			let files: FileList = target.files;
			this.file = files[0];
			this.fileType = this.file.type;
			this.fileName = this.authService.randomString(7) + this.authService.currentUser.username + '.' + this.file.type.split('/')[1];

			if (files[0].name.match(/.(jpg|jpeg|png)$/i)) {

				if (FileReader && files && files.length) {
					var fr = new FileReader();
					fr.onload = () => {
						this.image = fr.result;
						this.isImage = true;
						loader.dismiss();
					}
					fr.readAsDataURL(files[0]);
				}
			} else {
				loader.dismiss();
			}

		})
	}


	mentionsScroll() {
		if (!this.drag) this.drag = true; //solo queremos que se corra addmention() cuando se pica y no cuando se scrollea
	}

	mentionsClick(e, user) {
		this.stopBubble(e);
		if (this.drag) {
			this.drag = false; //restart

		} else {
			this.addMention(user.username);
		}

	}




	addMention(user) {

		let userProv = user.split('')
		userProv.unshift('@');
		userProv.push(' ');
		let prov = this.message.split('');
		prov.splice(this.caretStart, this.caretEnd, ...userProv);
		this.message = prov.join('');
		this.restartMentions();

	}


	sortMentions(search: string) {

		let searchTerm = search.substr(1); //eliminar el @
		this.items = this.chat.members
			.filter(f => f.username != this.authService.currentUser.username)
		this.sortedMentions = this.items.filter(i => new RegExp("^" + searchTerm).test(i.username))
			.sort((a, b) => (a.username > b.username) ? 1 : ((b.username > a.username) ? -1 : 0));

	}

	restartMentions() {
		this.mention = false;
		this.stringToMention = "";
		this.sortedMentions = [];
		this.caretEnd = 0;
		this.caretStart = 0;
	}

	capital(event) {


		if (event.key == "@") {
			this.mention = true;
			this.stringToMention = "";
			this.sortedMentions = [];
			this.caretStart = event.target.selectionStart;
			this.caretEnd = 0;


		}

		if (this.mention) {
			
			if (this.isKeyPrintable(event)) {
				this.caretEnd += 1;
				this.stringToMention += event.key;
				this.sortMentions(this.stringToMention)

			}

		}

		if (event.keyCode == 8) {
			if (this.mention && !!this.stringToMention) {
				if (this.stringToMention[this.stringToMention.length - 1] == "@") {
					this.restartMentions()
				}
				this.caretEnd += 1;
				this.stringToMention = this.stringToMention.substring(0, this.stringToMention.length - 1);
				this.sortMentions(this.stringToMention)

			}

		}

		if (event.keyCode == 32) {
			this.restartMentions()
		}


		if (this.message.length == 0) {
			this.cap = true;
		}
		else if (this.message.length == 1) {

			if (this.message) {
				this.message = this.message[0].toUpperCase() + this.message.substr(1);
				this.cap = false;
			}
		}
		else {
			this.cap = false;
		}
	}

	startTyping(event) {


		clearTimeout(this.startTimeout);
		if (this.canPublish) {
			let members = this.chat.members.map(m => m._id);
			this.webSocketService.emitStartTyping(this.chat, this.authService.currentUser.username, members)
		}

		this.canPublish = false;

		this.startTimeout = setTimeout(() => {
			this.canPublish = true;
			this.endTyping();
		}, 6000);


	}


	endTyping() {
		clearTimeout(this.startTimeout);
		this.canPublish = true
		let members = this.chat.members.map(m => m._id);
		this.webSocketService.emitEndTyping(this.chat, this.authService.currentUser.username, members)
	}


	handleState() {

		this.restartMentions()

		if (this.chat._id == "empty") {
			this.newMessageCreate();
		} else {
			this.newMessage();
		}

	}

	//TEXT
	newMessage() {

		this.chat.unreadMessageCount = 0;
		if (this.message.trim().length == 0 || this.message.length >= 5000) return;
		let data = {
			message: {
				message: this.message.trim(),
				customType: 'text',
				chat: this.chat._id
			},
			toUser: !!this.otherUser ? this.otherUser._id : undefined,
			room: this.chat.room || false,
			

		}

		let messageToAppend = {
			user: {
				_id: this.authService.currentUser._id,
				username: this.authService.currentUser.username,
				profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
			},
			message: this.message.trim(),
			customType: 'text',
			createdAt: Date.now()
		}


		this.endTyping();
		this.chat.lastMessage = messageToAppend;
		this.message = "";
		this.thirtyMessages();
		this.unreadMessages = false;

		if (this.chatService.channelMessages[this.chat._id]) {
			this.chatService.channelMessages[this.chat._id].push(messageToAppend);
		} else {
			this.chatService.channelMessages[this.chat._id] = [];
			this.chatService.channelMessages[this.chat._id].push(messageToAppend);
		}
		if (!this.atBottom) this.content.scrollToBottom(300);
		this.chatService.newMessage(this.chat._id, data)
			.subscribe((dataDB: any) => {

				

				if (dataDB.message) {
					dataDB.message.user = {
						_id: this.authService.currentUser._id,
						username: this.authService.currentUser.username,
						profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
					}

					if (!this.chat.room) this.chat.unreadMessages = dataDB.chat.unreadMessages;


					this.webSocketService.emitMessage(this.chat, dataDB.message, this.authService.currentUser._id)
				} else {

					this.toastCtrl.create({
						message: 'The message could not be sent. Either the recipient has blocked you or disabled DMs',
						duration: 5000,
						position: 'bottom'
					}).then(toast => {
						toast.present();

					})

				}

			},
				(err) => {
					this.toastCtrl.create({
						message: 'The message could not be sent.',
						duration: 5000,
						position: 'bottom'
					}).then(toast => {
						toast.present();

					})
				})


		//Para que vuelvan a ponerse las mayúsculas en el teclado



	}


	newMessageCreate() {

		if (this.message.trim().length == 0 || this.message.length >= 5000) return;

		this.loadingCtrl.create({
			spinner: 'crescent',
			message: "Creating chat...",
			cssClass: 'my-custom-loading',
		}).then(loader => {
			loader.present();
			let members = [];
			members.push(this.chat.recipient._id, this.authService.currentUser._id);
			let unreadMessages = members.map(member => {
				return {
					user: member,
					unreadMessageCount: 0,
					muted: false
				}
			})

			let data = {
				room: this.chat.room || false,
				message: {
					message: this.message.trim(),
					customType: 'text'
				},
				chat: {
					members,
					operatorsIds: [this.authService.currentUser._id],
					customType: '1-1',
					unreadMessages
				},
				toUser: !!this.otherUser ? this.otherUser._id : undefined

			}

			let messageToAppend = {
				user: {
					_id: this.authService.currentUser._id,
					username: this.authService.currentUser.username,
					profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
				},
				message: this.message.trim(),
				customType: 'text',
				createdAt: Date.now()
			}



			this.chatService.newMessage(this.chat._id, data)
				.subscribe((dataDB: any) => {

					if (dataDB.message) {
						
						setTimeout(() => {

							loader.dismiss();
							this.chat._id = dataDB.message.chat;
							this.chat.lastMessage = messageToAppend;
							this.chat.members = [this.chat.recipient, this.authService.currentUser];
							let chatForSocket = _.cloneDeep(this.chat);
							delete chatForSocket.recipient;
							delete chatForSocket.chatName;
							this.membersIds = this.chat.members.map(member => member._id)
							dataDB.message.user = {
								_id: this.authService.currentUser._id,
								username: this.authService.currentUser.username,
								profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
							}
							this.chat.unreadMessages = dataDB.chat.unreadMessages;
							chatForSocket.unreadMessages = dataDB.chat.unreadMessages;
							this.webSocketService.emitMessage(chatForSocket, dataDB.message, this.authService.currentUser._id)
							if (this.chatService.channelMessages[this.chat._id]) {
								this.chatService.channelMessages[this.chat._id].push(messageToAppend);
							} else {
								this.chatService.channelMessages[this.chat._id] = [];
								this.chatService.channelMessages[this.chat._id].push(messageToAppend);
							}

							this.message = "";
							this.unreadMessages = false;
							this.checkIfOnline();
						}, 500);
					} else {
						this.toastCtrl.create({
							message: 'The message could not be sent. Either the recipient has blocked you or disabled DMs',
							duration: 5000,
							position: 'bottom'
						}).then(toast => {
							toast.present();

						})
						loader.dismiss();
					}



				},
					(err) => {
						loader.dismiss();
					})
		})
	}

	goBack() {

		this.authService.addurl = false;
		this.navCtrl.pop();

	}


	goToInfo() {

		if (this.chat._id != "empty") this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/chat-info', this.chat._id]);

	}

	created(thread: any): string {

		let milliseconds = thread.getTime();
		let now = new Date();
		let millisecondsNow = now.getTime();
		let diffInHours = (millisecondsNow - milliseconds) / (1000 * 60 * 60); //hours
		let typeTime;

		if (diffInHours >= 24) {
			//DAYS
			let threadCreated = Math.floor(diffInHours / 24); //Template binding
			typeTime = "d"
			return `${threadCreated} ${typeTime}`

		} else if (diffInHours < 1 && diffInHours > 0) {
			//MINUTES
			let threadCreated = Math.ceil(diffInHours * 60); //Template binding
			typeTime = "min"
			return `${threadCreated} ${typeTime}`

		} else {
			//HOURS   
			let threadCreated = Math.floor(diffInHours); //Template binding
			typeTime = "h"
			return `${threadCreated} ${typeTime}`
		}
	}

}

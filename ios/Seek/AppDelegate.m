/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

static NSString *hasMigratedRealmDatabaseFromContainer = @"HasMigratedRealmDatabaseFromContainer";
static NSString *hasMigratedPhotosFromContainer = @"HasMigratedPhotosFromContainer";
static NSString *appGroupId = @"group.org.inaturalist.CardsSharing";

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [self createFakeMigrationData];
  
  if (![[NSUserDefaults standardUserDefaults] boolForKey:hasMigratedRealmDatabaseFromContainer]) {
    [self migrateRealmDatabaseFromSharedContainer];
  }
  
  if (![[NSUserDefaults standardUserDefaults] boolForKey:hasMigratedPhotosFromContainer]) {
    [self migratePhotosFromSharedContainer];
  }
  
  NSURL *jsCodeLocation;

  #ifdef DEBUG
    jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  #else
    jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  #endif

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"Seek"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (void)migrateRealmDatabaseFromSharedContainer {
  NSString *realmDbFilename = @"db.realm";
  // fm lets us do operations on the filesystem
  NSFileManager *fm = [NSFileManager defaultManager];
  // base url for the shared container
  NSURL *containerUrl = [fm containerURLForSecurityApplicationGroupIdentifier:appGroupId];
  if (containerUrl) {
    // url for the realm database in the container
    NSURL *containerRealmUrl = [containerUrl URLByAppendingPathComponent:realmDbFilename];
    if ([fm fileExistsAtPath:containerRealmUrl.path]) {
      // get the app document directory
      NSURL *documentsUrl =   [[fm URLsForDirectory:NSDocumentDirectory
                                          inDomains:NSUserDomainMask] lastObject];
      // url for the realm database in the app documents directory
      NSURL *documentsRealmUrl = [documentsUrl URLByAppendingPathComponent:realmDbFilename];
      // move error will go here
      NSError *moveError = nil;
      // perform the move
      [fm moveItemAtURL:containerRealmUrl toURL:documentsRealmUrl error:&moveError];
      if (moveError) {
        NSLog(@"error moving file: %@", moveError.localizedDescription);
      }
    }
  }

  // update the user defaults
  [[NSUserDefaults standardUserDefaults] setBool:YES
                                          forKey:hasMigratedRealmDatabaseFromContainer];
  [[NSUserDefaults standardUserDefaults] synchronize];
}

- (void)migratePhotosFromSharedContainer {
  // fm lets us do operations on the filesystem
  NSFileManager *fm = [NSFileManager defaultManager];
  // base url for the shared container
  NSURL *containerUrl = [fm containerURLForSecurityApplicationGroupIdentifier:appGroupId];
  if (containerUrl) {
    // url for the photo directory in the container
    NSURL *containerPhotoBaseUrl = [containerUrl URLByAppendingPathComponent:@"large"];
    NSString *containerPhotoBasePath = [containerPhotoBaseUrl path];
    
    // documents directory for photos
    NSString *documentsPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) firstObject];
    NSString *documentPhotoBasePath = [documentsPath stringByAppendingPathComponent:@"large"];
    if (![fm fileExistsAtPath:documentPhotoBasePath]) {
      NSError *mkdirError = nil;
      [fm createDirectoryAtPath:documentPhotoBasePath
    withIntermediateDirectories:NO
                     attributes:nil
                          error:&mkdirError];
      if (mkdirError) {
        NSLog(@"error creating large directory: %@", mkdirError.localizedDescription);
        return;
      }
    }
    
    NSError *fileScanError = nil;
    NSArray *contents = [fm contentsOfDirectoryAtPath:containerPhotoBasePath
                                                error:&fileScanError];
    if (fileScanError) {
      NSLog(@"error scanning filesystem: %@", fileScanError.localizedDescription);
      return;
    }
    
    for (NSString *containerPhoto in contents) {
      NSString *containerPhotoPath = [containerPhotoBasePath stringByAppendingPathComponent:containerPhoto];
      NSString *documentPhotoPath = [documentPhotoBasePath stringByAppendingPathComponent:containerPhoto];
      
      NSError *moveError = nil;
      [fm moveItemAtPath:containerPhotoPath
                  toPath:documentPhotoPath
                   error:&moveError];
      if (moveError) {
        NSLog(@"error moving photo file: %@", moveError.localizedDescription);
        return;
      }
    }
    
    // update the user defaults
    [[NSUserDefaults standardUserDefaults] setBool:YES
                                            forKey:hasMigratedPhotosFromContainer];
    [[NSUserDefaults standardUserDefaults] synchronize];

  }
}

- (void)createFakeMigrationData {
  
  // fm lets us do operations on the filesystem
  NSFileManager *fm = [NSFileManager defaultManager];
  // base url for the shared container
  NSURL *containerUrl = [fm containerURLForSecurityApplicationGroupIdentifier:appGroupId];
  if (containerUrl) {
    // url for the realm database in the container
    NSURL *containerRealmUrl = [containerUrl URLByAppendingPathComponent:@"db.realm"];
    NSString *containerRealmPath = [containerRealmUrl path];
    NSString *bundleRealmPath = [[NSBundle mainBundle] pathForResource:@"db" ofType:@".realm"];
    NSError *copyMigrationRealmError = nil;
    [fm copyItemAtPath:bundleRealmPath
                toPath:containerRealmPath
                 error:&copyMigrationRealmError];
    if (copyMigrationRealmError) {
      NSLog(@"error copying realm migration: %@", copyMigrationRealmError.localizedDescription);
    }
    
    NSString *bundleImagePath = [[NSBundle mainBundle] pathForResource:@"large" ofType:@".jpg"];
    
    NSArray *uuids = @[
                       @"1A72397B-2630-4C8C-A192-942C0D149F50",
                       @"ED9D9690-D4CE-4AF3-8D0D-DC3D002806F7",
                       @"5134AACD-BD26-4610-947B-93E824C39E3B",
                       @"043111F7-0B4F-42FF-8AC2-48258E31ED0E",
                       @"E478AC35-9862-4B0E-B1B6-149339F29CCB",
                       @"DA36E8F5-ACB8-4224-95D1-7A17EA9CA2DF",
                       @"3B46A2E7-9DD9-4FF8-B420-583F04D5C41A",
                       @"4C820AA8-F752-4F8B-B5C2-EFA70AB4BED0",
                       @"98AA3CDF-E4C5-4FC7-A5BD-CAA2B99DADD0",
                       @"0AE86435-B66F-4490-8242-4B54F1AC23FA",
                       @"1CE8CEF6-4C7E-453A-B21C-776DE9C7B35F",
                       @"A07FF90A-205E-432A-A910-EB3C97064D71",
                       @"9011EF61-02B8-45C6-8C42-8ADFDA6A567D",
                       @"132A1D12-CBCC-4600-A90E-25A803ABA636",
                       @"61FCFC11-C2E1-4D84-BB7C-9A081F7EB75D",
                       @"70633075-D3A9-4768-861B-47A1E885A35A",
                       @"D8081456-9EEC-4A48-88B4-2373AD27F68D",
                       @"790E3665-A611-478A-8F42-06D6F90CA1C6",
                       @"434DEEBB-D239-4F35-B2AD-A01F972FD2A3",
                       @"417383DE-7DEB-438E-8529-F3F63D31E1DC",
                       @"CC99D2A3-4DD8-414A-B81A-F490ECC27168",
                       @"B1B8A402-AA59-44BE-A48D-14B676E54A68",
                       @"7E74F91E-569F-43FD-9266-C54CD6972820",
                       @"F7FEE109-7E67-4313-A07F-686DE350419F",
                       @"B0A8FFDA-8B75-4357-9524-6D79E9E19179",
                       @"D6D99864-C931-42D1-8D0C-2344884A76E3",
                       @"7FC97430-1FD9-4D40-868D-DAB461BBBC56",
                       @"CCCAACAF-87A5-4A54-8CD7-AEA57D815289",
                       @"39626342-8375-4598-99C1-49158E0005BC",
                       @"7D6E8C5A-00D1-491C-B16D-4A56BFAC19BC",
                       @"E5CA9237-E245-4972-896D-1E6DA31DEB08",
                       @"611E8184-A3B3-4ED5-832B-212D94BF7A10",
                       @"675EF1E5-E464-4D97-B180-090A4318EACF",
                       @"87F520B2-5C53-4421-959C-ABB49FEE969C",
                       @"596E826F-F0E6-403C-8FF2-BAECF2DF8258",
                       @"B37BF718-A22E-4A0A-88F2-2DBFF528BF90",
                       @"606834AF-A183-4B10-A691-F013C1F3C1E8",
                       @"EEB64644-CA8D-43EC-9F4A-2C4C85E006F9",
                       @"161DF565-77A1-4705-8C9C-6EC99CB727F6",
                       @"125A3F2A-7A95-45ED-90B0-9CD0893640D3",
                       @"DA66A9DC-C961-4C60-A2F4-0B961A0DBE24",
                       @"EEAE74B2-D418-4818-A91F-F0040B2A8E17",
                       @"20A511DD-B9A5-42D4-BF46-14EA6B3F7370",
                       @"22656926-659B-4ED8-A589-81D5FC496C4B",
                       @"75302260-0B3E-4728-BCB6-107AE1F112AC",
                       @"B6CF0CA5-CF3E-4BDB-9E8B-9E789BAFA8C0",
                       @"BD63BD68-52C6-4188-8649-B505468A2C0B",
                       @"09C90B7C-96DB-4301-857F-468D4692CF51",
                       @"16214CCD-581A-4D55-A1DA-25E82D2756BB",
                       @"F41394D1-84A6-46C4-93F0-2095672A9B50",
                       @"4EE049A9-CC03-404D-9200-2840848602CF",
                       @"6E96318C-7CF5-45A9-A4FB-3134182B134B",
                       @"F840DC0B-B258-44DE-B00A-AC9D92FA11BD",
                       @"83E88E67-FD48-4D74-AF07-EF859A796DE7",
                       @"7F40BDC9-BABF-4B20-95FF-083965C10C62",
                       @"ED0665E8-0632-41A7-936A-B0D8760EC607",
                       @"B758AEA5-F7E9-40EC-854A-E8AE663AAEF3",
                       @"57A21F17-EE01-41A3-96CB-177066CBF507",
                       @"B0E4A8E7-A072-44BE-9E55-8D283189DF28",
                       @"3E7878D1-BA01-4336-87AE-F62C88A942F7",
                       @"BB7BAF4C-9AFC-4F1B-911F-67ED643940EB",
                       @"85B97A34-5DA3-40B8-8083-CE2BB81BD0B7",
                       @"925F006C-A38E-462B-A998-FB344796C426",
                       @"C2AF2693-C1FC-4D31-A347-6EDF9DF5C19D",
                       @"DE43ABBE-7C18-4CFB-BCB5-0B7463106D53",
                       @"793DCCB8-12BB-4FDE-BCFD-D7D6788A3593",
                       @"977CEEBF-B3BE-4C67-9D01-C69B44EB6EE6",
                       @"60D4AEF5-1C49-47FD-9A80-3857F0316D0F",
                       @"2C12E139-785C-4E87-A1D9-4E3F1E3B04A9",
                       @"0D8F1EEF-D9CC-426D-AFB8-5A6824705D01",
                       @"C521A623-D1AD-4442-8C96-8E19244C49C3",
                       @"3A7DEEE7-4BAF-4897-8583-5B7FE02B4C11",
                       @"6303A2A4-F8E6-4527-AFA8-7CE505F46D43",
                       @"7E104E1A-1EC9-47F5-8C3E-3B9F7BD42B9F",
                       @"57DE991F-F3A9-41C5-BB56-92EE1D308F54",
                       @"3C955012-313E-4B13-B99F-AC3B0BC1731E",
                       @"83341E51-12A3-4736-BADA-F3A7EDA7700D",
                       @"A34071B6-F2AD-4502-A724-503C6B24DED9",
                       @"454FD725-53B8-4756-8DBD-CE172483A15F",
                       @"D410AF6B-696D-40A2-9A2E-F13F69BB53D8",
                       @"E876A28E-E1EB-4603-96BD-584BC384B7E0",
                       @"A669CE7E-0C79-46C6-8268-BB618268F5DE",
                       @"D3BAD31B-C599-4764-8350-BAE50AE9AAC2",
                       @"83C93D7B-CE43-4F6A-A0ED-CFCF05D5CF84",
                       @"17A9D40B-40CC-4877-AD34-751BBBD1F310",
                       @"EEE320F3-402E-4BA9-9690-61BBAE8ECCD7",
                       @"65967FE9-9AB0-4F33-8A60-76096479B202",
                       @"CA8EF294-F189-4034-9D91-BF1658670658",
                       @"A0F4796E-43DD-4B34-8FAA-5CDF4B8C9FAD",
                       @"E8FAF63D-B0DC-4839-ABDD-23D0E98EA374",
                       @"2DA0A426-3CA4-4CD1-BE61-584ACBDA5DE2",
                       @"D8DC2E61-4F48-427A-8D43-ADF17B29D422",
                       @"FDDDD475-07B8-4F13-9B8E-6B192F43CA90",
                       @"8849FAA0-A96B-4D81-B81F-C77D98B84702",
                       @"C3F5D4CB-5A1D-462B-B033-824E8051EFDB",
                       @"F526AB03-F412-4D83-A148-63156D5CE0CA",
                       @"DDF0376E-6BB4-4E5E-89CE-912D28BF147D",
                       @"8C7CAC7D-5E5B-4B0D-AB0D-12DC89F1B9DF",
                       @"EB0B2FC8-80E2-4BA8-92CC-BDCC541F87A4",
                       @"F95EE31F-5C4D-4375-BC65-7FC33AC4B8F6",
                       @"751E7280-A21C-43F6-8107-C19CAE020332",
                       @"0C1B8F92-3C79-401F-B76D-5C75EC182A78",
                       @"D642E032-7240-49BC-BB46-39FFB3724918",
                       @"35355474-7318-4593-9C9C-86318FF80B19",
                       @"B5C44BAA-06F0-40A6-A508-F3BE1BAE9A3B",
                       @"E8A9FAC6-5B1F-4E42-A494-7F99CE3E1F06",
                       @"2885894C-4C1E-4966-A906-589611253B87",
                       @"6953A09A-F26C-4479-9E3A-6884E9192512",
                       @"D7682B5F-AED1-4DAF-A57A-AADB51D8476A",
                       @"4AA8BEDC-7FA6-441C-8884-4BA762454BF1",
                       @"CC9CFE17-9ABB-47A0-BF34-0607B88E128C",
                       @"0BFE3FA5-6B59-4AD2-8EA2-CEAE68B8ED1E",
                       @"29ED8F1D-79D3-4BB5-A23E-49FC23DBF5B2",
                       @"E08C26A2-46A6-4C39-A01D-C63C962BAD57",
                       @"8A537A50-D917-45FD-ACC0-7BA25EFC2973",
                       @"A2275E60-5565-4F2F-B2C6-B61053C49C61",
                       @"1A8C8B37-4429-4780-A4B3-E1587DB72E56",
                       @"C21961FF-BC55-4FAF-9BEB-6EF427F1CB3B",
                       @"15768932-2A81-4257-A456-F8A7A5DCC866",
                       @"46E34EAC-70AF-4B92-92E0-2DE548400EAD",
                       @"2FEBC274-03CD-476E-8545-E9F1DFBD8D4F",
                       @"82A9CB51-56D7-4308-9EC3-C94AABA68799",
                       @"4B561545-2D65-49A6-8ACD-90FC7F62EA5C",
                       @"E3A50D92-7A03-4DDD-A6D8-ECE377D79370",
                       @"43649B18-8AD7-4CF3-A8EE-3726CE1E192D",
                       @"C4148E01-6252-4D85-A061-796073CAEF89",
                       @"05776846-2BC9-4F44-9153-BC5E3F83D1A8",
                       @"208D5F49-63A2-4135-888E-E24B5B4749CA",
                       @"685CDFAF-7570-4226-AD65-907E3295E4D8",
                       @"F7E1CE6D-D790-485F-973E-94D42D2070D0",
                       @"78DFF778-3E22-4BD5-804D-8CFCE6BB47C1",
                       @"CD581FF1-A99D-4D72-B529-67438326CC6F",
                       @"0F453948-CD1C-44A4-8B1E-7F641AA08669",
                       @"1E1F6C1F-A409-4240-8BA7-22C1C0548E47",
                       @"CEF39FCE-7654-46B2-A237-FB8F70B72C59",
                       @"B294BE7E-EFC1-4211-A806-E00E2E2F0B85",
                       @"BCAEC30C-BC15-42AA-A7D1-18D48746F1B4",
                       @"1B5C4ADD-8A51-49C2-B08D-7207A8303FC5",
                       @"0CDD223A-27E6-4E62-8690-5AF96D3C203D",
                       @"EBCB224E-8E67-40E6-80DC-6855E0DF947D",
                       @"DD918BD1-C8B1-4D24-9785-796B348E38A2",
                       @"578D621E-22AE-44D0-94E1-94641FD70933",
                       @"F2FD4B91-550D-4A0C-92B3-C31D03D45884",
                       @"E406EB98-6FF2-40F1-AC84-187711BFB44C",
                       @"10324DCD-57E5-4403-B12E-DBB8821DEEA4",
                       @"75FBDC02-C5FC-41C7-BBFE-A9504BE9F199",
                       @"5363750C-682E-4FFD-833F-2A7D94BE2D09",
                       @"77F4693A-807C-43EE-9A0A-036FD57AEC8A",
                       @"978E9350-BA79-4BAE-8DDB-C3E304E2350E",
                       @"F00A6211-FB79-4B10-82E7-35000CE698F5",
                       @"749512B8-53BE-44B5-8329-8BDF5F7E5D04",
                       @"63C7712C-B7A2-47B0-8EDF-9D93B7F7AB88",
                       @"E760F869-BDD7-4075-AE88-1459567C8B52",
                       @"566ABCCF-1BC4-4B36-A815-5F053FC59542",
                       @"4CFE43CE-6DB1-4AA0-A0D8-B7077F036DAF",
                       @"D604B557-C10C-4409-99D3-84135B9EC5F6",
                       @"88E798F8-6BDC-4462-9F3F-93FFB0447ABC",
                       @"F01D8834-4DD1-4765-8100-E150A0DCF34C",
                       @"1411D1D1-657E-43FA-9E54-C0EF241E868D",
                       @"0B4C2BD7-0369-4F5D-AFCE-0415B04CACED",
                       @"72BD607B-9AF7-463F-90D9-5001B720604A",
                       @"E27B61A1-06B3-47F6-9D09-0807B099C6BA",
                       @"55C6D53B-DFF4-444A-AEEE-566D85F01685",
                       @"636A3466-2FD2-41AC-979C-308717A554E5",
                       @"BFF804C3-08B8-45AC-94C1-F592CA559270",
                       @"44B1BFC7-FFE1-4AEA-9261-84F8AAC8F9A4",
                       @"A8057D54-6F63-4970-A403-238F34DA71C1",
                       @"0C31544E-529A-4379-A2DB-8328D31F5CA8",
                       @"801DB369-ED58-4A27-838F-72DBC0B1C85D",
                       @"5AA14A29-BBF3-49E5-B6C7-ADA343E7EB7D",
                       @"C0BD719A-D8E7-48E6-B162-861714C82FE5",
                       @"61411A79-45AA-4C1B-ACED-5C38BDEF8844",
                       @"8954307F-40FD-4750-B973-D59252E43D1C",
                       @"E6E2BF22-FF33-42BE-8D12-E31470F45A82",
                       @"1C69E1EF-F89D-409C-9E88-790C61752F5C",
                       @"526B3552-5B92-438D-BF8C-58D4B4A5C9AD",
                       @"E8DD64DC-ADBB-41F4-9893-F1ADA9EFFBFF",
                       @"120762D5-DC7A-4CDA-8EB2-C0ADFFB98901",
                       @"E1BF585E-E8B0-4575-A8EB-BDF7313CE5BB",
                       @"290FA23B-6CEC-4153-AF59-9D763BF1AF5D",
                       @"486CEC25-A74B-4F51-BBB2-F19C9D53E955",
                       @"22899593-72C3-4935-9715-072EFAA859D0",
                       @"7D0F5320-99DC-4CBD-8A5B-A7493D084683",
                       @"40C74F89-7E7D-4F0F-BF44-B4962749DD97",
                       @"68F848B2-1F2D-47A9-8FE9-C6C2CD71AECE",
                       @"5EE9C426-6129-4EA5-8CC1-4DC9B95F9A90",
                       @"5FF2A727-66FD-4CF1-8B15-9A441E32F744",
                       @"B1BF74F0-1D60-4FF0-ABC3-B060CCFF3E37",
                       @"E6A8282B-6733-4819-A798-A4AE903AAB20",
                       @"72520F32-0D5F-4D79-9CA4-9A2B38DBAED3",
                       @"16C3C59B-4609-4816-A4ED-FC09BA7CE854",
                       @"918573C5-B3C9-4A80-BE36-62E2A2E040B0",
                       @"A27FD9F5-3814-477D-A139-7493643147DA",
                       @"48D9CC64-939B-48EB-9D74-9B0A4100245D",
                       @"3B3D9DAE-17EA-4F80-BDFE-4832C63D5F8A",
                       @"0AD6DDF2-FA88-4B59-AD71-C586770B9E91",
                       @"058DD9D2-1CF2-4468-900B-4C6645417FAE",
                       @"B7BC29F7-FE05-4337-8D6E-187E909D009D",
                       @"1FF66FBE-240E-4CD3-9CA2-C5472830C733",
                       @"6F9AE0AB-EA93-4271-B2D7-85CB26DF7419"
                       ];
    
    // url for the photo directory in the container
    NSURL *containerPhotoBaseUrl = [containerUrl URLByAppendingPathComponent:@"large"];
    NSString *containerPhotoBasePath = [containerPhotoBaseUrl path];

    if (![fm fileExistsAtPath:containerPhotoBasePath]) {
      NSError *mkdirError = nil;
      [fm createDirectoryAtPath:containerPhotoBasePath
    withIntermediateDirectories:NO
                     attributes:nil
                          error:&mkdirError];
      if (mkdirError) {
        NSLog(@"error creating large container directory: %@", mkdirError.localizedDescription);
      }
    }
    
    for (NSString *uuidString in uuids) {
      NSString *containerPhotoPath = [containerPhotoBasePath stringByAppendingPathComponent:uuidString];
      NSError *copyError = nil;
      [fm copyItemAtPath:bundleImagePath toPath:containerPhotoPath error:&copyError];
      if (copyError) {
        NSLog(@"error copying file into container: %@", copyError.localizedDescription);
      }
    }
  }
}
  




@end

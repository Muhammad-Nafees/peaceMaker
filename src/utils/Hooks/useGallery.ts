import {
  CameraRoll,
  PhotoIdentifier,
  cameraRollEventEmitter,
} from '@react-native-camera-roll/camera-roll';

import {useCallback, useEffect, useState} from 'react';

import {Alert, AppState, EmitterSubscription, Platform} from 'react-native';
import {hasAndroidPermission, hasIosPermission} from '../permissions';

interface GalleryOptions {
  pageSize: number;
  mimeTypeFilter?: Array<string>;
}

interface GalleryLogic {
  photos?: PhotoIdentifier[];
  loadNextPagePictures: () => void;
  isImageLoading: boolean;
  isLoadingNextPage: boolean;
  isReloading: boolean;
  hasNextPage: boolean;
}

const supportedMimeTypesByTheBackEnd = [
  'image/jpeg',
  'image/png',
  'image/heif',
  'image/heic',
  'image/heif-sequence',
  'image/heic-sequence',
];

export const useGallery = ({
  pageSize = 30,
  mimeTypeFilter = supportedMimeTypesByTheBackEnd,
}: GalleryOptions): GalleryLogic => {
  const [isImageLoading, setIsLoading] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<string>();
  const [photos, setPhotos] = useState<PhotoIdentifier[]>();

  const loadNextPagePictures = useCallback(async () => {
    try {
      // if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      //   Alert.alert('Permission denied', 'Allow permission to access images');
      //   return;
      // } else if (Platform.OS === 'ios' && !(await hasIosPermission())) {
      //   Alert.alert('Permission denied', 'Allow permission to access images');
      //   return;
      // }
      nextCursor ? setIsLoadingNextPage(true) : setIsLoading(true);
      const {edges, page_info} = await CameraRoll.getPhotos({
        first: pageSize,
        after: nextCursor,
        assetType: 'Photos',
        mimeTypes: mimeTypeFilter,
      });
      const photos = edges;
      setPhotos(prev => [...(prev ?? []), ...photos]);

      setNextCursor(page_info.end_cursor);
      setHasNextPage(page_info.has_next_page);
    } catch (error) {
      console.error('useGallery getPhotos error:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingNextPage(false);
    }
  }, [mimeTypeFilter, nextCursor, pageSize]);

  const getUnloadedPictures = useCallback(async () => {
    try {
      // if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      //   Alert.alert('Permission denied', 'Allow permission to access images');
      //   return;
      // } else if (Platform.OS === 'ios' && !(await hasIosPermission())) {
      //   Alert.alert('Permission denied', 'Allow permission to access images');
      //   return;
      // }

      setIsReloading(true);
      const {edges, page_info} = await CameraRoll.getPhotos({
        first: !photos || photos.length < pageSize ? pageSize : photos.length,
        assetType: 'Photos',
        mimeTypes: mimeTypeFilter,
      });
      const newPhotos = edges;
      setPhotos(newPhotos);

      setNextCursor(page_info.end_cursor);
      setHasNextPage(page_info.has_next_page);
    } catch (error) {
      console.error('useGallery getNewPhotos error:', error);
    } finally {
      setIsReloading(false);
    }
  }, [mimeTypeFilter, pageSize, photos]);

  useEffect(() => {
    if (!photos) {
      loadNextPagePictures();
    }
  }, [loadNextPagePictures, photos]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        if (nextAppState === 'active') {
          getUnloadedPictures();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [getUnloadedPictures]);

  return {
    photos,
    loadNextPagePictures,
    isImageLoading,
    isLoadingNextPage,
    isReloading,
    hasNextPage,
  };
};

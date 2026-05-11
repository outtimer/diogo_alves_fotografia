/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PhotoCategory = 'Landscape' | 'Urban' | 'Wildlife' | 'Daily';

export interface Photo {
  id: string;
  url: string;
  title: string;
  location: string;
  category: PhotoCategory;
  description?: string;
  date: string;
}

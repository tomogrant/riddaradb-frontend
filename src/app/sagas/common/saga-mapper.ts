import { Injectable } from '@angular/core';
import { ISagaDto } from './ISagaDto';
import { ISagaVm } from './ISagaVm';
import { ISagaVersionDto } from './ISagaVersionDto';
import { ISagaVersionVm } from './ISagaVersionVm';
import { SagaDate } from './SagaDate';

@Injectable({
  providedIn: 'root',
})
export class SagaMapper {

  sagaDto: ISagaDto = {
    id: 0,
    title: '',
    description: '',
    translated: false,
    sagaVersionIds: []
  }

  sagaVersionDto: ISagaVersionDto = {
    id: 0,
    title: '',
    description: '',
    date: SagaDate.UNKNOWN,
    isTranslated: false,
    sagaId: 0,
    bibIds: [],
    folkloreIds: [],
    personIds: [],
    placeIds: [],
    objectIds: [],
    msIds: []
    }

  mapSagaVmToDto(vm: ISagaVm): ISagaDto {

    this.sagaDto.id = vm.id;
    this.sagaDto.title = vm.title;
    this.sagaDto.description = vm.description;
    this.sagaDto.translated = vm.translated;
    this.sagaDto.sagaVersionIds = vm.sagaVersions.flatMap(sagaVersion => sagaVersion.id);

    return this.sagaDto;
  }

  mapSagaVersionVmToDto(vm: ISagaVersionVm): ISagaVersionDto {
    this.sagaVersionDto.id = vm.id,
    this.sagaVersionDto.title = vm.title,
    this.sagaVersionDto.description = vm.description,
    this.sagaVersionDto.date = vm.date,
    this.sagaVersionDto.sagaId = vm.sagaId,
    this.sagaVersionDto.bibIds = vm.bibDto.flatMap(bib => bib.id);

    return this.sagaVersionDto;
  }
  
}

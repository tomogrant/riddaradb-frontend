import { Injectable } from '@angular/core';
import { ISagaDto } from './ISagaDto';
import { ISagaVm } from './ISagaVm';
import { ISagaVersionRequestDto } from './ISagaVersionRequestDto';
import { ISagaVersionResponseDto } from './ISagaVersionResponseDto';
import { ISagaVersionVm } from './ISagaVersionVm';
import { IBibVm } from '../../bib/common/IBibVm';
import { BibMapper } from '../../bib/common/bib-mapper';

@Injectable({
  providedIn: 'root',
})
export class SagaMapper {
  constructor(private bibMapper: BibMapper){}

  mapSagaVmToDto(vm: ISagaVm): ISagaDto {

    return {
      id: vm.id,
      title: vm.title,
      description: vm.description,
      translated: vm.translated,
      sagaVersionIds: vm.sagaVersions.flatMap(sagaVersion => sagaVersion.id)
    }
  }

  mapSagaVersionVmToRequestDto(vm: ISagaVersionVm): ISagaVersionRequestDto {

    return {
      id: vm.id,
      title: vm.title,
      description: vm.description,
      date: vm.date,
      sagaId: vm.sagaId,
      bibIds: vm.bibIds,
      folkloreIds: [],
      personIds: [],
      placeIds: [],
      objectIds: [],
      msIds: []
    }

  }
  
  mapSagaVersionResponseDtoToVm(dto: ISagaVersionResponseDto): ISagaVersionVm {

    var bibVms: IBibVm[] = [];

    dto.bibDto.forEach(bibDto =>{
      bibVms.push(this.bibMapper.mapDtoToVm(bibDto));
    });

    bibVms.sort((a, b) => a.bibliographyEntry.localeCompare(b.bibliographyEntry));

    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      date: dto.date,
      isTranslated: false,
      sagaId: dto.sagaId,
      bibIds: bibVms.flatMap(bib => bib.id),
      primarySources: bibVms.filter(bib => bib.primarySource == true),
      secondarySources: bibVms.filter(bib => bib.primarySource == false)
    };
  }

}

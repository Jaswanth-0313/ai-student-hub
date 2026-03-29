import React from 'react'
import { PageContainer } from '../components/ui/PageContainer'
import { SectionTitle } from '../components/ui/SectionTitle'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { openToolWindow } from '../utils/tabManager'

export default function DevCPP() {
  return (
    <PageContainer>
      <SectionTitle
        title="DevC++ v5.11"
        subtitle="A lightweight C/C++ environment for practice and compilation" />

      <Card className="space-y-4">
        <p className="text-gray-300">DevC++ v5.11 is included as a supported learning tool in AI Student Hub.</p>
        <p className="text-gray-300">Use this screen to access compiler resources and quick-start C++ examples.</p>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            className="gap-2"
            onClick={() => openToolWindow('devcpp', 'https://sourceforge.net/projects/orwelldevcpp/')}
          >
            Open DevC++ v5.11
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => openToolWindow('online-cpp', 'https://www.onlinegdb.com/online_c++_compiler')}
          >
            Open Online C++ Compiler
          </Button>
        </div>
      </Card>
    </PageContainer>
  )
}
